import { createApp, ref } from 'vue';

let app = null;
let appInstance = null;

const AppComponent = {
  props: ['appInfo'],
  setup(props) {
    const count = ref(0);

    return {
      count,
      appInfo: props.appInfo,
      increment() {
        count.value++;
      },
      notifyHost() {
        window.custom && window.custom.emit('vue:increment', { count: count.value });
      }
    };
  },
  template: `
    <div class="vue-app">
      <h2>Vue 子应用</h2>
      <p>来自主应用的 props: {{ JSON.stringify(appInfo) }}</p>
      <div class="count">计数: {{ count }}</div>
      <button @click="increment">+1</button>
      <button @click="notifyHost">通知主应用</button>
    </div>
  `
};

export async function bootstrap() {
  console.log('[vueApp] bootstrap');
}

export async function mount(props) {
  console.log('[vueApp] mount', props);
  const container = document.querySelector('#vue-container') || document.getElementById('vue-root');
  if (container) {
    appInstance = createApp(AppComponent, { appInfo: props });
    appInstance.mount(container);
    app = appInstance;
  }
}

export async function unmount() {
  console.log('[vueApp] unmount');
  if (appInstance) {
    appInstance.unmount();
    appInstance = null;
    app = null;
  }
}
