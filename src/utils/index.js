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
  return filterApp('activeRule', currentUrl);
}

export const findAppByRoute = (router) => {
  return filterApp('activeRule', router);
}

export const filterApp = (key, value) => {
  const currentApp = getList().filter(item => item[key] === value);
  return currentApp && currentApp.length ? currentApp[0] : {};
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

  const currentSubApp = window.location.pathname.match(/(\/\w+)/);

  if (!currentSubApp) {
    return false;
  }

  window.__CURRENT_SUB_APP__ = currentSubApp[0];

  window.__CURRENT_HASH__ = hash;

  return true;
}
