import { createWorker } from 'tesseract.js';
import shortId from 'shortid';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';


export async function extractText(image: string) {
  const response = await fetch(image);
  const download = `../cache/${shortId.generate()}${path.extname(image)}`;
  const dest = fs.createWriteStream(download);
  response.body.pipe(dest);
  const worker = createWorker({
    logger: (m) => console.log(m),
  });
  try {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(download);
    return text;  
  } finally {
    await worker.terminate();
    fs.unlinkSync(download);
  }
}
