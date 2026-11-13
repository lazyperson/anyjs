/**
 * anyjs 微前端框架
 * 主入口文件 - 浏览器直接引用时使用
 */

// 核心 API
export {
  registerMicroApps,
  registerMicroApp,
  unregisterMicroApp,
  loadMicroApp,
  start,
  getMicroApps,
  getCurrentApp
} from './start';

// 全局状态管理
export { createStore } from './store';

// 沙箱相关
export {
  setSandboxMode,
  getSandboxMode,
  setScriptMode,
  getScriptMode,
  createSandbox,
  activateSandbox,
  deactivateSandbox
} from './sandbox';

// 生命周期
export { mountApp, unmountApp, runMainLifeCycle } from './lifeCycle';

// 工具函数
export { fetchResource } from './utils/fetchResource';
export { getResources, parseHtml, loadHtml, clearCache } from './loader';

// 事件通信
export { Custom } from './customevent';

// 版本号
export const version = '2.0.0';
