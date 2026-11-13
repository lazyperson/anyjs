// anyjs Vue 子应用示例（纯原生，无构建工具依赖）
// 通过 window.vueApp 导出生命周期

let containerEl = null;
let vueState = { count: 0 };

function render(container, props) {
  const appInfo = (props && props.appInfo) || {};

  container.innerHTML = `
    <div class="vue-app" style="padding:20px;font-family:sans-serif;">
      <h2 style="color:#42b983;margin-bottom:12px;">💚 Vue 子应用（原生版）</h2>
      <p style="color:#666;margin-bottom:12px;">此应用通过 anyjs 加载，无需构建工具</p>
      <p style="color:#666;margin-bottom:12px;">主应用传入的 props: <code>${JSON.stringify(appInfo)}</code></p>
      <div style="font-size:24px;color:#333;margin:12px 0;" id="vue-count-display">计数: ${vueState.count}</div>
      <button
        id="vue-btn-inc"
        style="padding:8px 16px;margin:4px;background:#42b983;color:#fff;border:none;border-radius:4px;cursor:pointer;"
      >+1</button>
      <button
        id="vue-btn-notify"
        style="padding:8px 16px;margin:4px;background:#f0f0f0;border:1px solid #ddd;border-radius:4px;cursor:pointer;"
      >📢 通知主应用</button>
      <div style="margin-top:12px;padding:8px;background:#f8f9fa;border-radius:4px;font-size:12px;color:#999;">
        window.custom 事件通信：
        <button style="margin-left:8px;" id="vue-btn-hello">发送 hello 事件</button>
      </div>
    </div>
  `;

  // 绑定事件（简单模拟 Vue 的响应式）
  container.querySelector('#vue-btn-inc').addEventListener('click', () => {
    vueState.count++;
    const el = container.querySelector('#vue-count-display');
    if (el) el.textContent = `计数: ${vueState.count}`;
  });

  container.querySelector('#vue-btn-notify').addEventListener('click', () => {
    if (window.custom) {
      window.custom.emit('vue:increment', { count: vueState.count });
    }
  });

  container.querySelector('#vue-btn-hello').addEventListener('click', () => {
    if (window.custom) {
      window.custom.emit('vue:hello', { msg: '来自 Vue 子应用' });
    }
  });
}

// ===== anyjs 生命周期导出 =====

export async function bootstrap() {
  console.log('[vueApp] bootstrap');
}

export async function mount(props) {
  console.log('[vueApp] mount', props);

  const selector = (props && props.container) || '#vue-container';
  containerEl = document.querySelector(selector);

  if (!containerEl) {
    console.error('[vueApp] 找不到容器:', selector);
    return;
  }

  render(containerEl, props);
}

export async function unmount() {
  console.log('[vueApp] unmount');
  if (containerEl) {
    containerEl.innerHTML = '';
    containerEl = null;
  }
}

// 挂到 window，确保沙箱内 eval 可以拿到
if (typeof window !== 'undefined') {
  window.vueApp = { bootstrap, mount, unmount };
}
