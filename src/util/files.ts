import * as path from 'path';
import * as fs from 'fs/promises';

import output from './output';

export const replaceExtension = (fileName: string, ext: string) =>
  path.join(
    path.dirname(fileName),
    path.basename(fileName, path.extname(fileName)) + '.' + ext
  );

/**
 * Write edited files to a temp filename so we don't mess with the original
 */
export const getTempName = (fileName: string): string => {
  const split = fileName.split('.');
  split[split.length - 2] = `${split[split.length - 2]}_tmp`;
  return split.join('.');
};

export const removeExt = (s: string) => s.replace(/\.[^/.]+$/, '');

export const checkPathExists = async (path: string) => {
  try {
    await fs.stat(path);
    return true;
  } catch {
    return false;
  }
};

export const replaceFile = async (oldPath: string, newPath: string) => {
  output.log(`Replacing ${newPath} => ${oldPath}`);
  await fs.unlink(oldPath);
  await fs.rename(newPath, oldPath);
};

export const validDirectoryPath = async (dir: string) => {
  try {
    const stats = await fs.stat(dir);

    return stats.isDirectory();
  } catch (e) {
    return false;
  }
};

export const getFileList = (dir: string) => fs.readdir(dir);
