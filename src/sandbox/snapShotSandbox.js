export class SnapShotSandbox {
  constructor() {
    this.proxy = window;
    this.snapshot = new Map();
    this.newKeys = new Set();
    this.active();
  }

  active() {
    // 记录当前 window 的快照
    this.snapshot = new Map();

    for (const key in window) {
      this.snapshot.set(key, window[key]);
    }
  }

  inactive() {
    // 恢复 window 到快照状态
    const currentKeys = new Set(Object.keys(window));

    // 1. 删除新增属性
    for (const key of currentKeys) {
      if (!this.snapshot.has(key)) {
        try {
          delete window[key];
        } catch (e) {
          window[key] = undefined;
        }
      }
    }

    // 2. 恢复被修改的属性
    for (const [key, value] of this.snapshot) {
      if (window[key] !== value) {
        window[key] = value;
      }
    }
  }
}
