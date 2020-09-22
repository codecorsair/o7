import config from '../config.json';


export function isDevModeEnabled() {
    return !!config.dev;
}