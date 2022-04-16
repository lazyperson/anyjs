import { performScriptForEval } from './performScript';
// import { SnapShotSandbox } from './snapShotSandbox';
import { ProxySandbox } from './proxySandbox';

const isCheckLifeCycle = lifecycle => lifecycle &&
  lifecycle.bootstrap &&
  lifecycle.mount &&
  lifecycle.unmount;

export const sandBox = (app, script) => {

  const proxy = new ProxySandbox();

  if (!app.proxy) {
    app.proxy = proxy;
  }

  window.__MICRO_WEB__ = true;

  const lifecycle = performScriptForEval(script, app.name, app.proxy.proxy);

  if (isCheckLifeCycle(lifecycle)) {
    app.bootstrap = lifecycle.bootstrap;
    app.mount = lifecycle.mount;
    app.unmount = lifecycle.unmount;
  }
}
