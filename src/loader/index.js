import { fetchResource } from '../utils/fetchResource';
import { sandBox, createSandbox } from '../sandbox';

// 资源缓存
const cache = new Map();

// 获取缓存
export const getCache = (key) => cache.get(key);

// 设置缓存
export const setCache = (key, value) => {
  cache.set(key, value);
}

// 检查是否有缓存
export const hasCache = (key) => cache.has(key);

// 清空缓存
export const clearCache = () => {
  cache.clear();
}

/**
 * 加载子应用 HTML 并执行其中的脚本
 */
export const loadHtml = async (app) => {
  const container = app.container;
  const entry = app.entry;

  // 确保应用有沙箱实例
  if (!app.proxy) {
    app.proxy = createSandbox();
  }

  // 检查缓存
  let htmlCache = getCache(app.name);

  if (!htmlCache) {
    const [dom, scripts, styles] = await parseHtml(entry, app.name);

    // 处理样式隔离
    const processedDom = await processStyleIsolation(app, dom);

    // 加载外部样式
    await loadStyles(styles);

    htmlCache = { dom: processedDom, scripts };
    setCache(app.name, htmlCache);
  }

  const ct = document.querySelector(container);

  if (!ct) {
    throw new Error(`anyjs: 容器 ${container} 不存在，请检查配置`);
  }

  // 清空容器
  ct.innerHTML = '';

  // 创建子应用根元素
  const appElement = document.createElement('div');
  appElement.id = `anyjs-${app.name}`;
  appElement.setAttribute(`data-anyjs-${app.name}`, '');
  appElement.innerHTML = htmlCache.dom;

  // Shadow DOM 模式
  if (app.styleIsolation === 'shadow' && appElement.attachShadow) {
    const shadowRoot = appElement.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = htmlCache.dom;
    ct.appendChild(appElement);
    // 记录 shadowRoot 供后续清理
    app.instance = appElement;
    app.shadowRoot = shadowRoot;
  } else {
    ct.appendChild(appElement);
    app.instance = appElement;
  }

  // 执行所有脚本（顺序执行，确保依赖正确）
  for (const script of htmlCache.scripts) {
    if (!script) continue;
    await sandBox(app, script);
  }

  return app;
}

/**
 * 解析 HTML，提取 DOM 和脚本
 */
export const parseHtml = async (entry, name) => {
  const html = await fetchResource(entry);

  let allScript = [];
  const div = document.createElement('div');
  div.innerHTML = html;

  const [dom, scriptUrl, script, styles] = await getResources(div, entry);

  // 获取外部脚本内容
  const fetchedScripts = await Promise.all(
    scriptUrl.map(async item => {
      try {
        return await fetchResource(item);
      } catch (error) {
        console.warn(`anyjs: 加载脚本 ${item} 失败:`, error);
        return null;
      }
    })
  );

  // 过滤掉加载失败的脚本
  allScript = script.concat(fetchedScripts.filter(Boolean));

  return [dom, allScript, styles];
}

/**
 * 递归解析 HTML 资源
 */
export const getResources = async (root, entry) => {
  const scriptUrl = [];
  const script = [];
  const styles = [];

  function deepParse(element) {
    const children = element.children;
    const parent = element.parent;

    const nodeName = element.nodeName.toLowerCase();

    // 处理 script 标签
    if (nodeName === 'script') {
      const src = element.getAttribute('src');
      const type = element.getAttribute('type');

      // 跳过非 JavaScript 类型的 script
      if (type && !['text/javascript', 'application/javascript', 'module'].includes(type)) {
        if (parent) {
          parent.removeChild(element);
        }
        return;
      }

      if (!src) {
        script.push(element.innerHTML);
      } else {
        if (src.startsWith('http')) {
          scriptUrl.push(src);
        } else if (src.startsWith('/')) {
          // 绝对路径，基于 entry 的 origin
          try {
            const entryUrl = new URL(entry);
            scriptUrl.push(`${entryUrl.origin}${src}`);
          } catch {
            scriptUrl.push(`${entry}${src}`);
          }
        } else {
          // 相对路径
          scriptUrl.push(`${entry.replace(/\/$/, '')}/${src}`);
        }
      }

      // 替换为注释，避免重复执行
      if (parent) {
        parent.replaceChild(document.createComment('此 js 文件已经被 anyjs 替换'), element);
      }
      return;
    }

    // 处理 link 标签
    if (nodeName === 'link') {
      const href = element.getAttribute('href');
      const rel = element.getAttribute('rel');

      if (href && rel === 'stylesheet') {
        if (href.startsWith('http')) {
          styles.push(href);
        } else if (href.startsWith('/')) {
          try {
            const entryUrl = new URL(entry);
            styles.push(`${entryUrl.origin}${href}`);
          } catch {
            styles.push(`${entry}${href}`);
          }
        } else {
          styles.push(`${entry.replace(/\/$/, '')}/${href}`);
        }
      }
      return;
    }

    // 递归处理子元素
    for (let i = 0; i < children.length; i++) {
      deepParse(children[i]);
    }
  }

  deepParse(root);

  // 返回解析后的 DOM（script 已替换为注释）
  return [root.innerHTML, scriptUrl, script, styles];
}

/**
 * 加载外部样式
 */
const loadStyles = async (styles) => {
  for (const href of styles) {
    try {
      const css = await fetchResource(href);
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-anyjs-style', href);
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
    } catch (error) {
      console.warn(`anyjs: 加载样式 ${href} 失败:`, error);
    }
  }
}

/**
 * 处理样式隔离
 */
const processStyleIsolation = async (app, dom) => {
  const mode = app.styleIsolation || 'none';

  if (mode === 'scoped') {
    return addScopedPrefix(app, dom);
  }

  // shadow 模式在 loadHtml 挂载时处理
  return dom;
}

/**
 * 为样式添加 scoped 前缀
 */
const addScopedPrefix = (app, dom) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${dom}</div>`, 'text/html');
  const styleElements = doc.querySelectorAll('style');

  styleElements.forEach(style => {
    const css = style.textContent;
    const scopedCss = scopeCss(css, app.name);
    style.textContent = scopedCss;
  });

  return doc.body.firstChild ? doc.body.firstChild.innerHTML : dom;
}

/**
 * CSS 作用域处理
 */
const scopeCss = (css, appName) => {
  return css.replace(/(^|\}|\s)([^{}@]+)\{/g, (match, prefix, selector) => {
    const trimmedSelector = selector.trim();
    if (!trimmedSelector || trimmedSelector.startsWith('@')) {
      return match;
    }
    return `${prefix}[data-anyjs-${appName}] ${trimmedSelector}{`;
  });
}

/**
 * 预加载资源
 */
export const prefetchApps = async (apps) => {
  const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 2000));

  return new Promise((resolve) => {
    idleCallback(async () => {
      await Promise.all(
        apps.map(async app => {
          if (!hasCache(app.name)) {
            try {
              const [dom, scripts, styles] = await parseHtml(app.entry, app.name);
              const processedDom = await processStyleIsolation(app, dom);
              await loadStyles(styles);
              setCache(app.name, { dom: processedDom, scripts });
            } catch (error) {
              console.warn(`anyjs: 预加载 ${app.name} 失败:`, error);
            }
          }
        })
      );
      resolve();
    });
  });
}
