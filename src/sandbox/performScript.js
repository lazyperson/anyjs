
// 执行js脚本
export const performScriptForFunction = (script, appName, global) => {
  window.proxy = global;
  const scriptText = `
    return ((window) => {
      ${script}
      return window['${appName}']
    })(window.proxy)
  `;
  return new Function(scriptText)();
}

export const performScriptForEval = (script, appName, global) => {
  // library window.appName
  window.proxy = global;
  const scriptText = `
    ((window) => {
      ${script}
      return window['${appName}'] 
    })(window.proxy)
  `;
  return eval(scriptText);
}
