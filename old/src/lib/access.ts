import config from '../config';


export function isDevModeEnabled() {
    return !!config.dev;
}
