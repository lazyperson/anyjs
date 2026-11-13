// 执行 JS 脚本，支持两种模式

/**
 * 使用 Function 构造函数执行脚本
 * 性能较好，适合生产环境
 */
export const performScriptForFunction = (script, appName, global) => {
  const scriptText = `
    return ((window) => {
      ${script}
      return window['${appName}'] || window.__ANYJS_LIFECYCLE__
    }).call(window, window.proxy)
  `;

  try {
    // 设置全局代理
    const originalProxy = window.proxy;
    window.proxy = global;

    const result = new Function(scriptText)();

    // 恢复原始值
    window.proxy = originalProxy;

    return result;
  } catch (error) {
    console.error(`anyjs: 子应用 ${appName} 脚本执行出错:`, error);
    throw error;
  }
}

/**
 * 使用 eval 执行脚本
 * 调试方便，适合开发环境
 */
export const performScriptForEval = (script, appName, global) => {
  const scriptText = `
    ((window) => {
      ${script}
      return window['${appName}'] || window.__ANYJS_LIFECYCLE__
    }).call(window, window.proxy)
  `;

  try {
    // 设置全局代理
    const originalProxy = window.proxy;
    window.proxy = global;

    const result = eval(scriptText);

    // 恢复原始值
    window.proxy = originalProxy;

    return result;
  } catch (error) {
    console.error(`anyjs: 子应用 ${appName} 脚本执行出错:`, error);
    throw error;
  }
}
