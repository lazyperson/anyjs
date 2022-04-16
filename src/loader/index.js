import { fetchResource } from '../utils/fetchResource';
import { sandBox } from "../sandbox";

export const loadHtml = async (app) => {
  // 第一个，子应用需要显示在哪里
  let container = app.container; // #id 内容

  let entry = app.entry;

  const [ dom, scripts ] = await parseHtml(entry, app.name);

  const ct = document.querySelector(container);

  if (!ct) {
    throw new Error('anyjs：容器不存在，请查看');
  }

  ct.innerHTML = dom;

  scripts.forEach(item => {
    sandBox(app, item);
  });

  return app;
}

const cache = {};

export const parseHtml = async (entry, name) => {
  if (cache[name]) {
    return cache[name];
  }
  const html = await fetchResource(entry);

  let allScript = [];
  const div = document.createElement('div');
  div.innerHTML = html;

  const [dom, scriptUrl, script] = await getResources(div, entry);

  const fetchedScripts = await Promise.all(scriptUrl.map(async item => fetchResource(item)));

  allScript = script.concat(fetchedScripts);

  cache[name] = [dom, allScript];

  return [dom, allScript];
}

export const getResources = async (root, entry) => {
  // js 链接  src  href
  const scriptUrl = [];
  // 写在script中的js脚本内容
  const script = [];
  const dom = root.outerHTML;

  function deepParse(element) {
    const children = element.children
    const parent = element.parent;

    if (element.nodeName.toLowerCase() === 'script') {
      const src = element.getAttribute('src');
      if (!src) {
        script.push(element.outerHTML);
      } else {
        if (src.startsWith('http')) {
          scriptUrl.push(src);
        } else {
          scriptUrl.push(`http:${entry}/${src}`);
        }
      }

      if (parent) {
        parent.replaceChild(document.createComment('此 js 文件已经被微前端替换'), element);
      }
    }

    // link 也会有js的内容
    if (element.nodeName.toLowerCase() === 'link') {
      const href = element.getAttribute('href');

      if (href.endsWith('.js')) {
        if (href.startsWith('http')) {
          scriptUrl.push(href);
        } else {
          scriptUrl.push(`http:${entry}/${href}`);
        }
      }
    }

    for (let i = 0; i < children.length; i++) {
      deepParse(children[i]);
    }
  }

  deepParse(root);

  return [dom, scriptUrl, script];
}
