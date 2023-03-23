import murmurhash from 'murmurhash';
import fs from 'fs';
// import msg_index from '../../staticdata/gettext/msg_index/index.json';

type supported_languages = 'de' | 'en' | 'fr' | 'ja' | 'por' | 'ru' | 'spa' | 'zh' | 'zhcn';

export const languages = [
  'de',
  'en',
  'fr',
  'ja',
  'por',
  'ru',
  'spa',
  'zh',
  'zhcn'
];

export function textlookup(source: string, target_lang: supported_languages) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile('staticdata/gettext/msg_index/index.json', (e, d) => {
      if (e) {
        reject(e)
        return;
      }

      let msg_index;
      try {
         msg_index = JSON.parse(d.toString("utf8"));
      } catch (ex) {
        reject(ex);
      }

      const key = murmurhash.v3(source, 2538058380) + '';
      const msgId = msg_index[key];
      const categoryId = (msgId / 1000) | 0;
      const textPath = `staticdata/gettext/${target_lang}/${categoryId}.json`;
      fs.readFile(textPath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          let json = JSON.parse(data.toString("utf8"));
          resolve(json[msgId])
        } catch (ex) {
          reject(ex);
        }
      });
    });
  });
}