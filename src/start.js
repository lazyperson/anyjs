import { setList, getList } from './const/subApps';
import { currentApp, validateAppConfig } from './utils';
import { rewriteRouter } from './router/rewriteRouter';
import { setMainLifecycle } from './const/mainLifeCycle';
import { prefetch } from './loader/prefetch';
import { Custom } from './customevent';
import { mountApp } from './lifeCycle';
import { setSandboxMode, setScriptMode } from './sandbox';

// 初始化全局自定义事件
const custom = new Custom();
window.custom = custom;

// 全局配置
let isStarted = false;
let options = {};

/**
 * 注册子应用
 */
export const registerMicroApps = (appList, lifeCycle) => {
  if (!Array.isArray(appList)) {
    throw new Error('anyjs: registerMicroApps 第一个参数必须是数组');
  }

  // 校验每个应用的配置
  appList.forEach(app => {
    validateAppConfig(app);
  });

  setList(appList);

  if (lifeCycle) {
    setMainLifecycle(lifeCycle);
  }
}

/**
 * 注册单个微应用
 */
export const registerMicroApp = (app, lifeCycle) => {
  validateAppConfig(app);
  const currentList = getList();
  setList([...currentList, app]);

  if (lifeCycle) {
    setMainLifecycle(lifeCycle);
  }
}

/**
 * 卸载微应用
 */
export const unregisterMicroApp = async (name) => {
  const currentList = getList();
  const app = currentList.find(item => item.name === name);

  // 如果应用已挂载，先卸载
  if (app && app.status === 'MOUNTED') {
    const { unmountApp } = await import('./lifeCycle');
    await unmountApp(app);
  }

  const newList = currentList.filter(item => item.name !== name);
  setList(newList);
}

/**
 * 手动加载微应用
 */
export const loadMicroApp = async (app) => {
  const existing = getList().find(item => item.name === app.name);
  const targetApp = existing || app;
  validateAppConfig(targetApp);
  return await mountApp(targetApp);
}

/**
 * 启动微前端
 */
export const start = (opts = {}) => {
  if (isStarted) {
    console.warn('anyjs: 已经启动过，请勿重复调用 start()');
    return;
  }

  isStarted = true;
  options = opts;

  // 应用沙箱配置
  if (opts.sandbox) {
    if (typeof opts.sandbox === 'string') {
      setSandboxMode(opts.sandbox);
    } else if (typeof opts.sandbox === 'object') {
      setSandboxMode(opts.sandbox.mode || 'proxy');
    }
  }

  // 应用脚本执行模式
  if (opts.scriptMode) {
    setScriptMode(opts.scriptMode);
  }

  // 重写路由
  rewriteRouter();

  const apps = getList();

  if (!apps.length) {
    throw new Error('anyjs: 子应用列表为空，请先注册应用');
  }

  const app = currentApp();
  const { pathname, hash } = window.location;

  if (!app) {
    console.warn('anyjs: 当前路由未匹配到任何子应用');
  } else {
    window.__CURRENT_SUB_APP__ = app.activeRule;
  }

  // 启动预加载
  if (opts.prefetch !== false) {
    prefetch();
  }

  // 触发自定义启动事件
  window.custom.emit('anyjs:started', { options: opts });

  console.log('anyjs: 微前端已启动');
}

/**
 * 获取应用列表
 */
export const getMicroApps = () => {
  return getList();
}

/**
 * 获取当前激活的应用
 */
export const getCurrentApp = () => {
  return currentApp();
}
