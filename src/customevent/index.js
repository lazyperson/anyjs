export class Custom {
  constructor() {
    this.events = new Map();
    this.listeners = new Map(); // 记录 cb -> wrappedListener 的映射，便于正确 off
  }

  on(name, cb) {
    if (!this.events.has(name)) {
      this.events.set(name, []);
    }
    this.events.get(name).push(cb);

    // 包装监听函数，用于正确移除
    const wrappedListener = (e) => cb(e.detail);
    this.listeners.set(cb, wrappedListener);

    window.addEventListener(name, wrappedListener);
  }

  emit(name, data) {
    const event = new CustomEvent(name, {
      detail: data
    });
    window.dispatchEvent(event);
  }

  // 取消监听
  off(name, cb) {
    if (!this.events.has(name)) return;

    const callbacks = this.events.get(name);
    const index = callbacks.indexOf(cb);
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    // 移除 window 事件监听
    const wrappedListener = this.listeners.get(cb);
    if (wrappedListener) {
      window.removeEventListener(name, wrappedListener);
      this.listeners.delete(cb);
    }
  }

  // 只监听一次
  once(name, cb) {
    const onceCallback = (data) => {
      cb(data);
      this.off(name, onceCallback);
    };
    this.on(name, onceCallback);
  }

  // 清空所有监听
  clear() {
    this.listeners.forEach((wrappedListener, cb) => {
      // 找到事件名并移除
      this.events.forEach((callbacks, name) => {
        const index = callbacks.indexOf(cb);
        if (index > -1) {
          window.removeEventListener(name, wrappedListener);
        }
      });
    });
    this.events.clear();
    this.listeners.clear();
  }
}
