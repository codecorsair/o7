import fs from 'fs';
import request from 'request';

export function download(url: string, path: string) {
  return new Promise((resolve, reject) => {
    request.head(url, () => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', resolve)
        .on('error', reject)
    });
  });
}
