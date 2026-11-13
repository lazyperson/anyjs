import React from 'react';
import { createRoot } from 'react-dom/client';

let root = null;

function App(props) {
  const [count, setCount] = React.useState(0);

  return React.createElement('div', { className: 'react-app' },
    React.createElement('h2', null, 'React 子应用'),
    React.createElement('p', null, `来自主应用的 props: ${JSON.stringify(props.appInfo || {})}`),
    React.createElement('div', { className: 'count' }, `计数: ${count}`),
    React.createElement('button', {
      onClick: () => setCount(c => c + 1)
    }, '+1'),
    React.createElement('button', {
      onClick: () => {
        // 通过自定义事件与主应用通信
        window.custom && window.custom.emit('react:increment', { count: count + 1 });
      }
    }, '通知主应用')
  );
}

// anyjs 生命周期导出
export async function bootstrap() {
  console.log('[reactApp] bootstrap');
}

export async function mount(props) {
  console.log('[reactApp] mount', props);
  const container = document.querySelector('#react-container') || document.getElementById('react-root');
  if (container) {
    root = createRoot(container);
    root.render(React.createElement(App, { appInfo: props }));
  }
}

export async function unmount() {
  console.log('[reactApp] unmount');
  if (root) {
    root.unmount();
    root = null;
  }
}
