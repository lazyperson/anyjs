import { fetchResource } from '../util';

// 根据子应用的name来做缓存
const cache = {};

export const parseHtml = async (entry, name) => {
    if (cache[name]) {
        return cache[name];
    }
    const html = await fetchResource(entry);


    const div = document.createElement('div');
    div.innerHTML = html;

    const [dom, scriptUrl, script] = await getResources(div, entry);

    const fetchedScripts = await Promise.all(scriptUrl.map(async item => fetchResource(item)));

    let allScript = [];
    allScript = script.concat(fetchedScripts);
    cache[name] = [dom, allScript];

    return [dom, allScript];
}

export const loadHtml = async (app) => {
    // #id 内容
    let container = app.container;

    // 子应用的入口
    let entry = app.entry;

    const [ dom, scripts ] = await parseHtml(entry, app.name);

    const ct = document.querySelector(container);
;
    if (!ct) {
        throw new Error('容器不存在，请查看')
    }
    ct.innerHTML = dom;
    scripts.forEach(item => {
        // TODO: 去加载执行js
    })
    return app;
}



export const getResources = async (root, entry) => {
    // js 链接  src  href
    const scriptUrl = [];
    // 写在script中的js脚本内容
    const script = [];
    const dom = root.outerHTML;
    // 深度解析
    function deepParse(element) {
        const children = element.children;
        const parent = element.parent;

        // 第一步处理位于 script 中的内容
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
