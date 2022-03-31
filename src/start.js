import { getMicroAppList, setMicroAppList } from './const/microApps';
import { setMainLifecycle } from './const/mainLifeCycle';
import { currentApp } from './util';

export const registerMicroApps = (appList, lifeCycle) => {
    setMicroAppList(appList);
    setMainLifecycle(lifeCycle);
};

export const start = () => {
    const apps = getMicroAppList();

    if (Array.isArray(apps) && !apps.length) {
        throw Error('anyjs提示：子应用列表为空，请检查注册的应用列表。');
    }

    const app = currentApp();
    const { pathname, hash } = window.location;
    if (!hash) {
        //TODO: 当前没有匹配到正确的子应用，怎么处理？
    }

    if (app && hash) {
        const url = pathname + hash;
        window.__$ANYJS_CURRENT_MICRO_APP__ = app.activeRule;
        window.history.pushState('', '', url);
    }

};
