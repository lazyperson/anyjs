import { findAppByRoute } from '../utils';
import { getMainLifecycle } from '../const/mainLifeCycle';
import { loadHtml } from '../loader';
import { activateSandbox, deactivateSandbox, createSandbox } from '../sandbox';

/**
 * 生命周期主流程
 */
export const lifecycle = async () => {
  // 获取上一个应用和下一个应用
  const prevApp = findAppByRoute(window.__ORIGIN_APP__);
  const nextApp = findAppByRoute(window.__CURRENT_SUB_APP__);

  if (!nextApp) {
    console.warn('anyjs: 未找到要激活的子应用');
    return;
  }

  // 卸载上一个应用
  if (prevApp && prevApp !== nextApp && prevApp.unmount) {
    await unmountApp(prevApp);
  }

  // 加载并挂载新应用
  await mountApp(nextApp);
}

/**
 * 挂载应用
 */
export const mountApp = async (app) => {
  try {
    // 如果应用已挂载，直接返回
    if (app.status === 'MOUNTED') {
      return app;
    }

    // 运行 beforeLoad 钩子
    await runMainLifeCycle('beforeLoad', app);

    // 加载应用 HTML 和脚本
    if (app.status === 'NOT_LOADED') {
      // 确保应用有沙箱实例
      if (!app.proxy) {
        app.proxy = createSandbox();
      }
      await loadHtml(app);
    }

    // 激活沙箱
    activateSandbox(app);

    // 运行 bootstrap 生命周期
    if (app.bootstrap && app.status === 'LOADED') {
      await app.bootstrap(app);
      app.status = 'BOOTSTRAPPED';
    }

    // 运行 beforeMount 钩子
    await runMainLifeCycle('beforeMount', app);

    // 运行 mount 生命周期
    if (app.mount) {
      // 确保 DOM 已挂载
      if (!app.instance) {
        const ct = document.querySelector(app.container);
        if (ct) {
          app.instance = ct.firstElementChild || ct;
        }
      }

      await app.mount({
        appInfo: app.appInfo,
        entry: app.entry,
        container: app.container,
        props: app.props || {},
        customEvent: window.custom
      });
      app.status = 'MOUNTED';
    }

    // 运行 mounted 钩子
    await runMainLifeCycle('mounted', app);

    return app;
  } catch (error) {
    console.error(`anyjs: 挂载应用 ${app.name} 失败:`, error);
    app.status = 'MOUNT_ERROR';
    throw error;
  }
}

/**
 * 卸载应用
 */
export const unmountApp = async (app) => {
  try {
    // 运行 beforeUnmount 钩子
    await runMainLifeCycle('beforeUnmount', app);

    // 运行 unmount 生命周期
    if (app.unmount && app.status === 'MOUNTED') {
      await app.unmount({
        appInfo: app.appInfo,
        entry: app.entry,
        container: app.container
      });
    }

    // 失活沙箱
    deactivateSandbox(app);

    // 清理 DOM
    if (app.instance) {
      // Shadow DOM 模式直接清空 shadowRoot
      if (app.shadowRoot) {
        app.shadowRoot.innerHTML = '';
        app.shadowRoot = null;
      } else {
        const container = document.querySelector(app.container);
        if (container) {
          container.innerHTML = '';
        }
      }
      app.instance = null;
    }

    app.status = 'UNMOUNTED';

    // 运行 destroyed 钩子
    await runMainLifeCycle('destroyed', app);

    return app;
  } catch (error) {
    console.error(`anyjs: 卸载应用 ${app.name} 失败:`, error);
    app.status = 'UNMOUNT_ERROR';
    throw error;
  }
}

/**
 * 运行主应用生命周期钩子
 */
export const runMainLifeCycle = async (type, app) => {
  const mainLifeCycle = getMainLifecycle();
  const handlers = mainLifeCycle[type];

  if (!handlers || !Array.isArray(handlers)) {
    return;
  }

  try {
    await Promise.all(
      handlers.map(async handler => await handler(app))
    );
  } catch (error) {
    console.error(`anyjs: 主应用生命周期 ${type} 执行出错:`, error);
  }
}
