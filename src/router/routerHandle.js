import { isTurnChild } from '../utils';
import { lifecycle } from '../lifeCycle';

/**
 * 路由变化处理函数
 */
export const turnApp = async () => {
  try {
    if (isTurnChild()) {
      await lifecycle();
    }
  } catch (error) {
    console.error('anyjs: 应用切换失败:', error);
  }
}
