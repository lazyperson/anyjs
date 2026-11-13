// 记录真实 window 的原始属性描述符，用于后续正确恢复
const rawWindowDescriptors = {};

function cacheWindowDescriptors() {
  if (Object.keys(rawWindowDescriptors).length > 0) return;
  const keys = Object.getOwnPropertyNames(window);
  keys.forEach(key => {
    try {
      rawWindowDescriptors[key] = Object.getOwnPropertyDescriptor(window, key);
    } catch (e) {
      // 某些属性（如浏览器内部属性）可能无法读取描述符，跳过
    }
  });
}

export class ProxySandbox {
  constructor() {
    this.proxy = null;
    this.defaultValue = new Map();
    this.rawWindow = window;
    this.sandboxKeys = new Set();
    cacheWindowDescriptors();
    this.active();
  }

  active() {
    const self = this;

    this.proxy = new Proxy(this.rawWindow, {
      get(target, key) {
        // 处理 Symbol 等特殊属性
        if (typeof key === 'symbol') {
          return target[key];
        }

        // 优先从沙箱变量中获取
        if (self.defaultValue.has(key)) {
          return self.defaultValue.get(key);
        }

        const value = target[key];

        // 绑定函数到原始 window，避免 this 指向 proxy
        if (typeof value === 'function') {
          return value.bind(target);
        }

        return value;
      },
      set(target, key, value) {
        // 所有修改都记录在沙箱内部，不影响真实 window
        self.defaultValue.set(key, value);
        self.sandboxKeys.add(key);
        return true;
      },
      has(target, key) {
        return self.defaultValue.has(key) || key in target;
      },
      deleteProperty(target, key) {
        self.defaultValue.delete(key);
        self.sandboxKeys.delete(key);
        return true;
      },
      getOwnPropertyDescriptor(target, key) {
        if (self.defaultValue.has(key)) {
          return {
            value: self.defaultValue.get(key),
            writable: true,
            enumerable: true,
            configurable: true
          };
        }
        // 返回原始描述符的副本，避免 proxy 陷阱报错
        if (rawWindowDescriptors[key]) {
          return rawWindowDescriptors[key];
        }
        return Object.getOwnPropertyDescriptor(target, key);
      },
      ownKeys(target) {
        // 注意：ownKeys 必须返回字符串数组且不能包含不可配置属性
        // 收集所有可枚举的 key
        const keys = new Set();
        for (const key of Object.keys(target)) {
          keys.add(key);
        }
        for (const key of self.defaultValue.keys()) {
          keys.add(key);
        }
        return Array.from(keys);
      },
      defineProperty(target, key, descriptor) {
        // 拦截 defineProperty，记录到沙箱
        self.defaultValue.set(key, descriptor.value);
        self.sandboxKeys.add(key);
        return true;
      }
    });
  }

  inactive() {
    // 清空沙箱变量，实现隔离
    this.defaultValue.clear();
    this.sandboxKeys.clear();
  }

  // 获取沙箱中的变量
  get(key) {
    return this.defaultValue.get(key);
  }

  // 设置沙箱中的变量
  set(key, value) {
    this.defaultValue.set(key, value);
    this.sandboxKeys.add(key);
  }
}
