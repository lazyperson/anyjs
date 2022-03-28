import { getMicroAppList } from './const/microApps';

export const currentApp = () => {
    const currentUrl = window.location.pathname;
    return filterApp('activeRule', currentUrl);
}

export const findAppByRoute = (router) => {
    return filterApp('activeRule', router);
}

export const filterApp = (key, value) => {
    const currentApp = getMicroAppList().filter(item => item[key] === value);
    return currentApp && currentApp.length ? currentApp[0] : { };
}
