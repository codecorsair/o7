import locales from '../data/locales.json';

export type LANG = 'en' | 'ru';

export function localize(key: keyof typeof locales, lang: LANG = 'en') {
  if (locales[key]) return locales[key][lang];
}

export function _localize(key: string, lang: LANG) {
  if (locales[key]) return locales[key][lang];
}
