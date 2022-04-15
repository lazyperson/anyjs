import { performScriptForEval } from './performScript';
import { ProxySandbox } from './proxySandbox';

const isCheckLifeCycle = lifecycle => lifecycle &&
  lifecycle.bootstrap &&
  lifecycle.mount &&
  lifecycle.unmount;

// 子应用生命周期处理， 环境变量设置
export const sandBox = (app, script) => {

  const proxy = new ProxySandbox();

  if (!app.proxy) {
    app.proxy = proxy;
  }

  // 1. 设置环境变量
  window.__MICRO_WEB__ = true;

  // 2. 运行js文件
  const lifecycle = performScriptForEval(script, app.name, app.proxy.proxy);

  // 生命周期，挂载到app上
  if (isCheckLifeCycle(lifecycle)) {
    app.bootstrap = lifecycle.bootstrap;
    app.mount = lifecycle.mount;
    app.unmount = lifecycle.unmount;
  }
}
