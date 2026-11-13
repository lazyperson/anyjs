export const createStore = (initData = {}) => (() => {
  let store = initData;
  const observers = new Map();

  const getStore = () => store;

  const update = (value) => {
    if (value !== store) {
      const oldValue = store;
      store = value;

      // 通知所有观察者
      observers.forEach(async (callback, key) => {
        try {
          await callback(store, oldValue);
        } catch (error) {
          console.error(`anyjs: store observer "${key}" 执行出错:`, error);
        }
      });
    }
  };

  // 支持函数式更新
  const setStore = (updater) => {
    if (typeof updater === 'function') {
      update(updater(store));
    } else {
      update(updater);
    }
  };

  const subscribe = (name, fn) => {
    if (typeof name === 'function') {
      fn = name;
      name = `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    observers.set(name, fn);

    // 返回取消订阅函数
    return () => {
      observers.delete(name);
    };
  };

  const unsubscribe = (name) => {
    observers.delete(name);
  };

  return {
    getStore,
    update: setStore,
    subscribe,
    unsubscribe,
  };
})();
