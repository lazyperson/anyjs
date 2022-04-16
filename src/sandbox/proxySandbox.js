let defaultValue = {};

export class ProxySandbox{
  constructor() {
    this.proxy = null;

    this.active();
  }
  
  active() {
    
    this.proxy = new Proxy(window, {
      get(target, key) {
        if (typeof target[key] === 'function') {
          return target[key].bind(target);
        }
        return defaultValue[key] || target[key];
      },
      set(target, key, value) {
        defaultValue[key] = value;
        return true;
      }
    })

  }

  inactive () {
    defaultValue = {};
  }
}
