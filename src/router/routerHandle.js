import { isTurnChild } from '../utils';
import { lifecycle } from '../lifeCycle';

export const turnApp = async () => {
  if (isTurnChild()) {
    // 微前端的生命周期执行
    await lifecycle();
  }
}
