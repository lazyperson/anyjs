import { getList } from '../const/subApps';
import { parseHtml } from './index';

export const prefetch = async () => {
  const list = getList().filter(item => !window.location.pathname.startsWith(item.activeRule));

  // 预加载剩下的所有子应用
  await Promise.all(list.map(async item => await parseHtml(item.entry, item.name)));
}
