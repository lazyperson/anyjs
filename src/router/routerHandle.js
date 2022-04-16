import { isTurnChild } from '../utils';
import { lifecycle } from '../lifeCycle';

export const turnApp = async () => {
  if (isTurnChild()) {
    await lifecycle();
  }
}
