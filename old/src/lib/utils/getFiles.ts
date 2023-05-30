import fs from 'fs';
import { resolve } from 'path';

export async function* getFiles(dirPath: string, currentDepth: number, maxDepth: number, filter?: (file: string) => boolean){
  if (!fs.existsSync(dirPath)) return;
  const fileNames = await fs.promises.readdir(dirPath);
  for (const fileName of fileNames) {
    const path = resolve(dirPath, fileName);
    if ((await fs.promises.stat(path)).isDirectory()) {
      if (currentDepth < maxDepth) {
        yield* getFiles(path, currentDepth+1, maxDepth);
      }
    } else if (filter && !filter(fileName)) {
      continue;
    } else {
      yield path;
    }
  }
}
