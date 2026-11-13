# anyjs

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
  <img src="https://img.shields.io/badge/version-2.0.0-green.svg" alt="version" />
</p>

**anyjs** 是一个轻量级、功能完善的微前端框架，帮助开发者更简单、无痛地构建生产可用的微前端架构系统。

## 特性

- **技术栈无关** — 主框架不限制接入应用的技术栈，子应用具备完全自主权
- **独立开发部署** — 子应用仓库独立，前后端开发独立，部署独立
- **增量升级** — 支持渐进式重构，逐步升级 legacy 系统
- **独立运行时** — 每个子应用之间状态隔离，运行时状态不共享
- **JS 沙箱隔离** — 基于 Proxy 和快照两种沙箱方案，确保子应用间互不干扰
- **样式隔离** — 支持 scoped CSS 和 Shadow DOM 两种样式隔离方案
- **预加载** — 空闲时预加载未激活的子应用资源，提升切换速度
- **全局状态管理** — 提供简单高效的全局状态共享方案
- **通信机制** — 基于 CustomEvent 的跨应用通信机制

## 安装

```bash
npm install anyjs
```

## 快速开始

### 主应用

```javascript
import { registerMicroApps, start } from 'anyjs';

registerMicroApps([
  {
    name: 'reactApp',
    entry: '//localhost:8081',
    container: '#react-container',
    activeRule: '/react'
  },
  {
    name: 'vueApp',
    entry: '//localhost:8082',
    container: '#vue-container',
    activeRule: '/vue'
  }
], {
  beforeLoad: [async (app) => console.log('before load', app.name)],
  mounted: [async (app) => console.log('mounted', app.name)],
  destroyed: [async (app) => console.log('destroyed', app.name)]
});

start({
  sandbox: { mode: 'proxy' },  // 可选：proxy | snapshot | none
  prefetch: true               // 可选：是否预加载未激活的子应用
});
```

### 子应用

子应用需要通过 `window[appName]` 导出 `bootstrap`、`mount`、`unmount` 生命周期函数：

```javascript
// 方式1：通过 window 导出（推荐，兼容性好）
window.reactApp = {
  async bootstrap() {
    console.log('react app bootstrapped');
  },

  async mount(props) {
    console.log('react app mounted', props);
    ReactDOM.render(<App />, document.getElementById('react-container'));
  },

  async unmount() {
    ReactDOM.unmountComponentAtNode(document.getElementById('react-container'));
  }
};

// 方式2：ES Module 导出
export async function bootstrap() {}
export async function mount(props) {}
export async function unmount() {}
```

> **注意**：`window[appName]` 中的 `appName` 必须与主应用注册的 `name` 一致。

## API

### registerMicroApps(appList, lifeCycle)

注册子应用。

**appList 参数：**

| 参数 | 说明 | 类型 | 必填 |
|------|------|------|------|
| name | 子应用唯一标识，必须与 `window[name]` 一致 | string | ✓ |
| entry | 子应用入口（HTML 地址） | string | ✓ |
| container | 子应用挂载容器选择器（CSS Selector） | string | ✓ |
| activeRule | 子应用激活规则（路由前缀） | string | ✓ |
| props | 主应用传递给子应用的数据 | object | × |

**lifeCycle 参数：**

| 参数 | 说明 | 类型 |
|------|------|------|
| beforeLoad | 子应用加载前钩子 | array |
| mounted | 子应用挂载后钩子 | array |
| destroyed | 子应用卸载后钩子 | array |
| beforeMount | 子应用挂载前钩子 | array |
| beforeUnmount | 子应用卸载前钩子 | array |

### start(options)

启动微前端应用。

**options 参数：**

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| sandbox | 沙箱配置 | `{ mode: 'proxy' \| 'snapshot' \| 'none' }` | `{ mode: 'proxy' }` |
| prefetch | 是否预加载未激活的子应用 | boolean | `true` |
| scriptMode | 脚本执行模式 | `'eval' \| 'function'` | `'eval'` |

```javascript
start({
  sandbox: { mode: 'proxy' },
  prefetch: true,
  scriptMode: 'eval'
});
```

### registerMicroApp(app, lifeCycle)

注册单个微应用（增量注册）。

### unregisterMicroApp(name)

按名称卸载微应用。

### loadMicroApp(app)

手动加载微应用（不依赖路由）。

### getMicroApps()

获取已注册的应用列表。

### getCurrentApp()

获取当前激活的应用。

### createStore(initData)

创建全局状态管理器。

```javascript
import { createStore } from 'anyjs';

const store = createStore({ count: 0 });

const unsubscribe = store.subscribe((newValue, oldValue) => {
  console.log('store changed', newValue, oldValue);
});

store.update({ count: 1 });
// 或函数式更新
store.update(prev => ({ count: prev.count + 1 }));

// 取消订阅
unsubscribe();
```

### window.custom（事件通信）

```javascript
// 监听事件
window.custom.on('event-name', (data) => {
  console.log(data);
});

// 只监听一次
window.custom.once('event-name', (data) => {});

// 触发事件
window.custom.emit('event-name', { message: 'hello' });

// 取消监听
const cb = (data) => {};
window.custom.on('event-name', cb);
window.custom.off('event-name', cb);
```

## 子应用生命周期

子应用必须导出以下三个异步函数：

| 生命周期 | 触发时机 | 参数 |
|---------|---------|------|
| bootstrap | 应用首次加载前，仅执行一次 | `(app)` |
| mount | 应用激活时 | `({ appInfo, entry, container, props, customEvent })` |
| unmount | 应用切换离开时 | `({ appInfo, entry, container })` |

## 沙箱机制

anyjs 提供两种沙箱模式：

### Proxy 沙箱（默认）

使用 `Proxy` 拦截对 `window` 的读写，子应用的全局变量被隔离在沙箱内部，不影响真实 `window`。

```javascript
start({ sandbox: { mode: 'proxy' } });
```

### Snapshot 沙箱

在应用挂载时拍摄 `window` 快照，卸载时恢复，适合不支持 `Proxy` 的环境。

```javascript
start({ sandbox: { mode: 'snapshot' } });
```

## 样式隔离

anyjs 支持两种样式隔离方案，通过子应用配置启用：

```javascript
registerMicroApps([
  {
    name: 'reactApp',
    entry: '//localhost:9001',
    container: '#container',
    activeRule: '/react',
    styleIsolation: 'scoped'  // 或 'shadow'
  }
]);
```

| 模式 | 说明 |
|------|------|
| `scoped` | 为子应用的所有 CSS 选择器添加 `[data-anyjs-appName]` 前缀 |
| `shadow` | 使用 Shadow DOM 完全隔离子应用样式 |

## 为什么不用 iframe?

如果不考虑体验问题，iframe 几乎是最完美的微前端解决方案了。

iframe 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。但它的最大问题也在于隔离性无法被突破，导致应用间上下文无法被共享，随之带来的开发体验、产品体验的问题。

iframe 存在的问题：

- **URL 不同步** — 浏览器刷新 iframe url 状态丢失、后退前进按钮无法使用
- **UI 不同步，DOM 结构不共享** — 想象一下屏幕右下角 1/4 的 iframe 里来一个带遮罩层的弹框，同时我们要求这个弹框要浏览器居中显示，还要浏览器 resize 时自动居中...
- **全局上下文完全隔离，内存变量不共享** — iframe 内外系统的通信、数据同步等需求，主应用的 cookie 要透传到根域名都不同的子应用中实现免登效果
- **慢** — 每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程

## 示例

查看 [examples/](examples/) 目录获取完整示例，包括：
- `examples/host` — 主应用示例
- `examples/react-app` — React 子应用示例
- `examples/vue-app` — Vue 子应用示例

## License

MIT
