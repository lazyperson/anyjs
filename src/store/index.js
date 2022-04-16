export const createStore = (initData = {}) => (() => {
  let store = initData;
  const observers = [];

  const getStore = () => store;

  const update = (value) => {
    if (value !== store) {
      const oldValue = store;
      store = value;
      observers.forEach(async item => await item(store, oldValue));
    }
  }

  const subscribe = (fn) => {
    observers.push(fn);
  }

  return {
    getStore,
    update,
    subscribe,
  };
  
})();
