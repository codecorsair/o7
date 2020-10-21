import locales from '../data/locales.json';

export type LANG = 'en' | 'ru';
export type LocalizeKey = keyof typeof locales;

export function localize(key: LocalizeKey, prefix: string, lang: LANG = 'en') {
  return _localize(key, prefix, lang);
}

export function _localize(key: string, prefix: string, lang: LANG) {
  if (!locales[key]) return key;
  if (!locales[key][lang]) return locales[key]['en'].replace(/${prefix}/, prefix);
  return locales[key][lang]?.replace(/${prefix}/, prefix);
}
