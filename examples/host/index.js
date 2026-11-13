import { registerMicroApps, start, createStore } from '../../src/index';

// 创建全局 store，演示跨应用状态共享
const globalStore = createStore({
  user: { name: 'anyjs-user', role: 'admin' },
  theme: 'light',
  count: 0
});

// 暴露到 window，供子应用访问
window.globalStore = globalStore;

// 注册子应用
registerMicroApps([
  {
    name: 'reactApp',
    entry: '//localhost:9001',
    container: '#react-container',
    activeRule: '/react',
    props: {
      from: 'host',
      sharedStore: globalStore
    }
  },
  {
    name: 'vueApp',
    entry: '//localhost:9002',
    container: '#vue-container',
    activeRule: '/vue',
    props: {
      from: 'host',
      sharedStore: globalStore
    }
  }
], {
  beforeLoad: [
    async (app) => {
      console.log('[host] before load:', app.name);
    }
  ],
  mounted: [
    async (app) => {
      console.log('[host] mounted:', app.name);
      document.getElementById('active-app').textContent = app.name;
    }
  ],
  destroyed: [
    async (app) => {
      console.log('[host] destroyed:', app.name);
      document.getElementById('active-app').textContent = '无';
    }
  ]
});

// 启动
start({
  sandbox: { mode: 'proxy' },
  prefetch: true
});

// 路由导航
document.querySelectorAll('[data-route]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const route = link.getAttribute('data-route');
    window.history.pushState(null, '', route);
  });
});
