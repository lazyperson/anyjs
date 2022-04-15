/**
 * SnapShot沙箱
 * 用于兼容不支持Proxy的低版本浏览器
 */
export class SnapShotSandbox {
  constructor() {
    // 1. 代理对象
    this.proxy = window;

    this.active();
  }

  active() {
    this.snapshot = new Map();

    // 遍历全局环境
    for(const key in window) {
      this.snapshot[key] = window[key];
    }
  }
  
  inactive () {
    for (const key in window) {
      if (window[key] !== this.snapshot[key]) {
        // 还原操作
        window[key] = this.snapshot[key];
      }
    }
  }
}
