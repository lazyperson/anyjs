// anyjs 子应用需要导出 bootstrap / mount / unmount 生命周期
// 使用 window.reactApp = {...} 的方式导出（UMD 风格）

let renderCount = 0;
let containerEl = null;

function renderApp(container, props) {
  renderCount++;

  const appInfo = (props && props.appInfo) || {};

  container.innerHTML = `
    <div class="react-app" style="padding:20px;font-family:sans-serif;">
      <h2 style="color:#61dafb;margin-bottom:12px;">⚛️ React 子应用</h2>
      <p style="color:#666;margin-bottom:12px;">此应用通过 anyjs 加载，已渲染 <strong>${renderCount}</strong> 次</p>
      <p style="color:#666;margin-bottom:12px;">主应用传入的 props: <code>${JSON.stringify(appInfo)}</code></p>
      <div style="font-size:24px;color:#333;margin:12px 0;" id="react-count">计数: 0</div>
      <button
        style="padding:8px 16px;margin:4px;background:#61dafb;border:none;border-radius:4px;cursor:pointer;"
        onclick="window.__reactIncrement && window.__reactIncrement()"
      >+1</button>
      <button
        style="padding:8px 16px;margin:4px;background:#f0f0f0;border:1px solid #ddd;border-radius:4px;cursor:pointer;"
        onclick="window.__reactNotify && window.__reactNotify()"
      >📢 通知主应用</button>
      <div style="margin-top:12px;padding:8px;background:#f8f9fa;border-radius:4px;font-size:12px;color:#999;">
        window.custom 事件通信：
        <button style="margin-left:8px;" onclick="window.custom && window.custom.emit('react:hello', {msg:'来自React子应用'})">
          发送 hello 事件
        </button>
      </div>
    </div>
  `;

  let count = 0;
  window.__reactIncrement = () => {
    count++;
    const el = container.querySelector('#react-count');
    if (el) el.textContent = `计数: ${count}`;
  };

  window.__reactNotify = () => {
    if (window.custom) {
      window.custom.emit('react:increment', { count, renderCount });
    }
  };
}

// ===== anyjs 生命周期导出 =====

export async function bootstrap() {
  console.log('[reactApp] bootstrap');
}

export async function mount(props) {
  console.log('[reactApp] mount', props);

  // anyjs 会将子应用 HTML 挂载到 app.container 对应的 DOM
  // 这里获取主应用分配的容器
  const selector = (props && props.container) || '#react-container';
  containerEl = document.querySelector(selector);

  if (!containerEl) {
    console.error('[reactApp] 找不到容器:', selector);
    return;
  }

  renderApp(containerEl, props);
}

export async function unmount() {
  console.log('[reactApp] unmount');
  if (containerEl) {
    containerEl.innerHTML = '';
    containerEl = null;
  }
  window.__reactIncrement = null;
  window.__reactNotify = null;
}

// 同时挂到 window 上，兼容非模块加载场景
if (typeof window !== 'undefined') {
  window.reactApp = { bootstrap, mount, unmount };
}
