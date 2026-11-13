import { getList } from '../const/subApps';

export const patchRouter = (globalEvent, eventName) => {
  return function () {
    const e = new Event(eventName);
    globalEvent.apply(this, arguments);
    window.dispatchEvent(e);
  }
}

export const currentApp = () => {
  const currentUrl = window.location.pathname;
  // 使用前缀匹配，返回最匹配的（最长匹配）
  const apps = getList().filter(app => currentUrl.startsWith(app.activeRule));
  if (!apps.length) return null;
  // 返回 activeRule 最长的，确保最精确匹配
  return apps.reduce((a, b) => (a.activeRule.length >= b.activeRule.length ? a : b));
}

export const findAppByRoute = (router) => {
  if (!router) return null;
  const apps = getList().filter(app => router.startsWith(app.activeRule));
  if (!apps.length) return null;
  return apps.reduce((a, b) => (a.activeRule.length >= b.activeRule.length ? a : b));
}

export const filterApp = (key, value) => {
  const currentApp = getList().filter(item => item[key] === value);
  return currentApp && currentApp.length ? currentApp[0] : null;
}

export const isTurnChild = () => {
  const { pathname, hash } = window.location;
  const url = pathname + hash;

  // 当前路由无改变
  const currentPrefix = url.match(/(\/\w+)/g);

  if (
    currentPrefix &&
    (currentPrefix[0] === window.__CURRENT_SUB_APP__) &&
    hash === window.__CURRENT_HASH__
  ) {
    return false;
  }

  window.__ORIGIN_APP__ = window.__CURRENT_SUB_APP__;

  // 找到匹配当前 pathname 的应用
  const currentAppMatch = currentApp();
  const currentSubApp = currentAppMatch ? currentAppMatch.activeRule : null;

  if (!currentSubApp) {
    window.__CURRENT_SUB_APP__ = null;
    window.__CURRENT_HASH__ = hash;
    return false;
  }

  window.__CURRENT_SUB_APP__ = currentSubApp;

  window.__CURRENT_HASH__ = hash;

  return true;
}

// 校验应用配置是否完整
export const validateAppConfig = (app) => {
  if (!app.name || typeof app.name !== 'string') {
    throw new Error('anyjs: 子应用 name 必须是一个非空字符串');
  }
  if (!app.entry || typeof app.entry !== 'string') {
    throw new Error('anyjs: 子应用 entry 必须是一个非空字符串');
  }
  if (!app.container || typeof app.container !== 'string') {
    throw new Error('anyjs: 子应用 container 必须是一个非空字符串');
  }
  if (!app.activeRule || typeof app.activeRule !== 'string') {
    throw new Error('anyjs: 子应用 activeRule 必须是一个非空字符串');
  }
  // 检查重复 name
  const existing = getList().find(item => item.name === app.name);
  if (existing) {
    throw new Error(`anyjs: 子应用 name "${app.name}" 已存在`);
  }
  return true;
}

// 获取需要激活的应用
export const getActiveApps = () => {
  const { pathname } = window.location;
  return getList().filter(app => pathname.startsWith(app.activeRule));
}

// 获取需要卸载的应用
export const getInactiveApps = () => {
  const { pathname } = window.location;
  return getList().filter(app => !pathname.startsWith(app.activeRule));
}
