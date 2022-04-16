import { setList, getList } from './const/subApps';
import { currentApp } from './utils';
import { rewriteRouter } from './router/rewriteRouter';
import { setMainLifecycle } from './const/mainLifeCycle';
import { prefetch } from './loader/prefetch';
import { Custom } from './customevent';

const custom = new Custom();
custom.on('test', (data) => {
  console.log(data);
})

window.custom = custom;

rewriteRouter();

export const registerMicroApps = (appList, lifeCycle) => {
  setList(appList);

  setMainLifecycle(lifeCycle);
}

export const start = () => {

  const apps = getList();

  if (!apps.length) {
    throw Error('anyjs：子应用列表为空， 请正确注册应用');
  }

  const app = currentApp();

  const { pathname, hash } = window.location;

  if (!hash) {
    // 当前没有在使用的子应用, 抛出错误 或者 访问默认路由
    return;
  }

  if (app && hash) {
    const url = pathname + hash;

    window.__CURRENT_SUB_APP__ = app.activeRule;

    window.history.pushState('', '', url);
  }

  prefetch();
}
