# anyjs 示例项目

本目录包含 anyjs 微前端框架的完整示例，演示主应用 + React 子应用 + Vue 子应用的集成方式。

## 快速启动

```bash
# 1. 安装依赖（根目录 + 各示例项目）
npm install
cd examples/host && npm install && cd ../..
cd examples/react-app && npm install && cd ../..
cd examples/vue-app && npm install && cd ../..

# 2. 同时启动三个服务
# 终端1 - 主应用 (端口 9000)
cd examples/host && npm start

# 终端2 - React 子应用 (端口 9001)
cd examples/react-app && npm start

# 终端3 - Vue 子应用 (端口 9002)
cd examples/vue-app && npm start
```

然后访问 http://localhost:9000

## 项目结构

```
examples/
├── host/               # 主应用 (Webpack + Babel)
│   ├── index.html      # 主应用 HTML 模板
│   ├── index.js        # 主应用入口，注册子应用并启动 anyjs
│   ├── package.json
│   └── webpack.config.js
│
├── react-app/          # React 子应用（纯 ES 模块，无需构建）
│   ├── public/
│   │   ├── index.html  # 子应用 HTML（包含 script 标签引用 app.js）
│   │   └── app.js      # 子应用逻辑，导出 bootstrap/mount/unmount
│   ├── src/            # 备用 React 构建源码
│   ├── server.js       # 简单的静态文件服务器（端口 9001）
│   ├── package.json
│   └── webpack.config.js
│
└── vue-app/            # Vue 子应用（纯 ES 模块，无需构建）
    ├── public/
    │   ├── index.html
    │   └── app.js
    ├── src/            # 备用 Vue 构建源码
    ├── server.js       # 简单的静态文件服务器（端口 9002）
    ├── package.json
    └── webpack.config.js
```

## 子应用接入规范

子应用需要通过 `window[appName]` 导出以下生命周期函数：

```javascript
// 方式1: 通过 window 导出（anyjs 通过 window['appName'] 获取）
window.reactApp = {
  async bootstrap() { /* 初始化 */ },
  async mount(props) { /* 挂载 */ },
  async unmount() { /* 卸载 */ }
};

// 方式2: ES Module 导出
export async function bootstrap() {}
export async function mount(props) {}
export async function unmount() {}
```

## 主应用注册子应用

```javascript
import { registerMicroApps, start } from 'anyjs';

registerMicroApps([
  {
    name: 'reactApp',      // 与 window.reactApp 对应
    entry: '//localhost:9001',
    container: '#react-container',
    activeRule: '/react'
  },
  {
    name: 'vueApp',
    entry: '//localhost:9002',
    container: '#vue-container',
    activeRule: '/vue'
  }
]);

start();
```

## 注意事项

1. **CORS**: 子应用服务器需要配置 `Access-Control-Allow-Origin: *`，示例中的 server.js 已配置
2. **library 名称**: 子应用 `window[appName]` 的 `appName` 必须与主应用注册的 `name` 一致
3. **容器选择器**: `container` 必须是主应用中存在的 DOM 元素选择器
