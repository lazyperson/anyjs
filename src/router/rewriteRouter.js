import { patchRouter } from '../utils';
import { turnApp } from './routerHandle';

/**
 * 重写路由方法，拦截路由变化
 */
export const rewriteRouter = () => {
  // 保存原始方法
  if (!window.history.__originalPushState) {
    window.history.__originalPushState = window.history.pushState;
    window.history.__originalReplaceState = window.history.replaceState;
  }

  const originalPushState = window.history.__originalPushState;
  const originalReplaceState = window.history.__originalReplaceState;

  // 重写 pushState
  window.history.pushState = patchRouter(originalPushState, 'micro_push');

  // 重写 replaceState
  window.history.replaceState = patchRouter(originalReplaceState, 'micro_replace');

  // 监听自定义路由事件
  window.addEventListener('micro_push', turnApp);
  window.addEventListener('micro_replace', turnApp);

  // 监听 popstate（浏览器前进/后退）
  window.addEventListener('popstate', async () => {
    await turnApp();
  });

  // 监听 hashchange
  window.addEventListener('hashchange', async () => {
    await turnApp();
  });
}

/**
 * 恢复原始路由方法
 */
export const restoreRouter = () => {
  if (window.history.__originalPushState) {
    window.history.pushState = window.history.__originalPushState;
    delete window.history.__originalPushState;
  }
  if (window.history.__originalReplaceState) {
    window.history.replaceState = window.history.__originalReplaceState;
    delete window.history.__originalReplaceState;
  }
}
