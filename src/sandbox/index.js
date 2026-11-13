import { performScriptForEval, performScriptForFunction } from './performScript';
import { SnapShotSandbox } from './snapShotSandbox';
import { ProxySandbox } from './proxySandbox';

const isCheckLifeCycle = lifecycle => lifecycle &&
  lifecycle.bootstrap &&
  lifecycle.mount &&
  lifecycle.unmount;

// 沙箱模式配置
let sandboxMode = 'proxy'; // 'proxy' | 'snapshot' | 'none'

export const setSandboxMode = (mode) => {
  if (!['proxy', 'snapshot', 'none'].includes(mode)) {
    throw new Error('anyjs: 沙箱模式必须是 proxy、snapshot 或 none');
  }
  sandboxMode = mode;
}

export const getSandboxMode = () => sandboxMode;

// 执行脚本模式配置
let scriptMode = 'eval'; // 'eval' | 'function'

export const setScriptMode = (mode) => {
  if (!['eval', 'function'].includes(mode)) {
    throw new Error('anyjs: 脚本执行模式必须是 eval 或 function');
  }
  scriptMode = mode;
}

export const getScriptMode = () => scriptMode;

// 创建沙箱实例
export const createSandbox = () => {
  switch (sandboxMode) {
    case 'proxy':
      return new ProxySandbox();
    case 'snapshot':
      return new SnapShotSandbox();
    case 'none':
      return {
        proxy: window,
        active: () => {},
        inactive: () => {},
        get: (key) => window[key],
        set: (key, value) => { window[key] = value; }
      };
    default:
      return new ProxySandbox();
  }
}

// 执行脚本并提取生命周期
export const performScript = (script, appName, global) => {
  switch (scriptMode) {
    case 'eval':
      return performScriptForEval(script, appName, global);
    case 'function':
      return performScriptForFunction(script, appName, global);
    default:
      return performScriptForEval(script, appName, global);
  }
}

/**
 * 沙箱主函数：为子应用创建沙箱环境并执行脚本
 */
export const sandBox = async (app, script) => {
  // 标记微前端环境
  window.__MICRO_WEB__ = true;

  // 如果应用还没有沙箱实例，创建一个
  if (!app.proxy) {
    app.proxy = createSandbox();
  }

  let lifecycle;

  try {
    lifecycle = performScript(script, app.name, app.proxy.proxy);
  } catch (error) {
    console.error(`anyjs: 子应用 ${app.name} 脚本执行失败:`, error);
    app.status = 'LOAD_ERROR';
    throw error;
  }

  // 校验并提取生命周期函数
  if (isCheckLifeCycle(lifecycle)) {
    app.bootstrap = lifecycle.bootstrap;
    app.mount = lifecycle.mount;
    app.unmount = lifecycle.unmount;
    app.update = lifecycle.update || null;

    app.status = 'LOADED';

    return app;
  }

  // 如果没有导出生命周期，可能是分包的子脚本，继续执行下一段
  if (!lifecycle) {
    return app;
  }

  console.warn(`anyjs: 子应用 ${app.name} 未导出正确的生命周期函数 (bootstrap, mount, unmount)`);
  return app;
}

/**
 * 激活沙箱
 */
export const activateSandbox = (app) => {
  if (app.proxy && typeof app.proxy.active === 'function') {
    // SnapshotSandbox 需要重新记录快照
    if (app.proxy instanceof SnapShotSandbox) {
      app.proxy.active();
    }
  }
}

/**
 * 失活沙箱
 */
export const deactivateSandbox = (app) => {
  if (app.proxy && typeof app.proxy.inactive === 'function') {
    app.proxy.inactive();
  }
}
