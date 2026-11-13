let list = [];

export const getList = () => list;

export const setList = appList => {
  list = appList.map(app => ({
    ...app,
    // 确保每个应用都有唯一的沙箱实例引用
    proxy: null,
    // 应用状态：NOT_LOADED, LOADING, LOADED, BOOTSTRAPPED, MOUNTED, UNMOUNTED
    status: 'NOT_LOADED',
    // 存储应用导出的生命周期函数
    bootstrap: null,
    mount: null,
    unmount: null,
    update: null,
    // 存储子应用实例（用于卸载时清理）
    instance: null,
    // Shadow DOM 根节点
    shadowRoot: null
  }));
};
