export const createStore = (initData = {}) => (() => {
  let store = initData
  const observers = [] // 管理所有的订阅者，依赖

  // 获取store
  const getStore = () => store

  // 更新store
  const update = (value) => {
    if (value !== store) {
      // 执行store的操作
      const oldValue = store
      // 将store更新
      store = value
      // 通知所有的订阅者，监听store的变化
      observers.forEach(async item => await item(store, oldValue))
    }
  }
  // 添加订阅者
  const subscribe = (fn) => {
    observers.push(fn)
  }

  return {
    getStore,
    update,
    subscribe,
  }
})()
