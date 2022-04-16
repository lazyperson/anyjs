import { findAppByRoute } from '../utils';
import { getMainLifecycle } from '../const/mainLifeCycle';
import { loadHtml } from '../loader';

export const lifecycle = async () => {

  const prevApp = findAppByRoute(window.__ORIGIN_APP__);

  // 获取到要跳转到的子应用
  const nextApp = findAppByRoute(window.__CURRENT_SUB_APP__);

  if (!nextApp) {
    return;
  }

  if (prevApp && prevApp.unmount) {
    if (prevApp.proxy) {
      prevApp.proxy.inactive();
    }
    await destoryed(prevApp);
  }

  const app = await beforeLoad(nextApp);

  await mounted(app);
}

export const beforeLoad = async (app) => {
  await runMainLifeCycle('beforeLoad');

  app && app.beforeLoad && app.beforeLoad();

  const subApp = await loadHtml(app);
  subApp && subApp.beforeLoad && subApp.beforeLoad();

  return subApp;
}

export const mounted = async (app) => {
  app && app.mount && app.mount({
    appInfo: app.appInfo,
    entry: app.entry
  });

  await runMainLifeCycle('mounted');
}

export const destoryed = async (app) => {
  app && app.unmount && app.unmount();

  await runMainLifeCycle('destoryed');
}

export const runMainLifeCycle = async (type) => {
  const mainlife = getMainLifecycle();

  await Promise.all(mainlife[type].map(async item => await item()));
}
