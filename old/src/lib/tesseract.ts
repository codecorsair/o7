import { createWorker } from 'tesseract.js';
import shortId from 'shortid';
import path from 'path';
import fs from 'fs';
import { download } from './download';
import { imageSize,  } from 'image-size';


export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export async function extractText(image: string, rectMultipler: Rect) {
  const fileName = `./cache/${shortId.generate()}${path.extname(image)}`;
  await download(image, fileName);
  const dimensions = await new Promise<{ width: number; height: number; }>((resolve, reject) => {
    imageSize(fileName, (err, size) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(size as any);
    })
  });

  const worker = createWorker();
  try {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ[]0123456789 ',
    });
    const { data: { text } } = await worker.recognize(fileName, {
      rectangle: {
        top: dimensions.height * rectMultipler.top,
        left: dimensions.width * rectMultipler.left,
        height: dimensions.height * rectMultipler.height,
        width: dimensions.width * rectMultipler.width,
      }
    });
    return text;
  } finally {
    await worker.terminate();
    fs.unlinkSync(fileName);
  }
}
