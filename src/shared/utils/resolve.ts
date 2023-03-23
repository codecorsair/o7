import { join } from 'path';
import { existsSync } from 'fs';

export function resolve(...path: string[]): string {
  let resolvedPath = path.join('/');

  if (resolvedPath.startsWith('~')) {
    resolvedPath = join(process.env.HOME || '', resolvedPath.slice(1));
  }

  if (resolvedPath.startsWith('.')) {
    resolvedPath = join(process.cwd(), resolvedPath);
  }

  if (!existsSync(resolvedPath)) {
    throw new Error(`Path ${resolvedPath} does not exist`);
  }

  return resolvedPath;
}