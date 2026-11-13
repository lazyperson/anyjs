import { getList } from '../const/subApps';
import { parseHtml, prefetchApps } from './index';

export const prefetch = async () => {
  const currentPath = window.location.pathname;

  // 获取未激活的子应用
  const inactiveApps = getList().filter(
    item => !currentPath.startsWith(item.activeRule) && item.status === 'NOT_LOADED'
  );

  if (inactiveApps.length === 0) {
    return;
  }

  console.log(`anyjs: 预加载 ${inactiveApps.length} 个子应用`);

  await prefetchApps(inactiveApps);
}
