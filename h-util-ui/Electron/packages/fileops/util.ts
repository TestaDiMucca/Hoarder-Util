import path from 'path';
import fs from 'fs/promises';

/**
 * Write edited files to a temp filename so we don't mess with the original
 */
export const getTempName = (fileName: string): string => {
    const split = fileName.split('.');
    split[split.length - 2] = `${split[split.length - 2]}_tmp`;
    return split.join('.');
};

export const replaceExtension = (fileName: string, ext: string) =>
    path.join(path.dirname(fileName), path.basename(fileName, path.extname(fileName)) + '.' + ext);

export const removeExt = (s: string) => s.replace(/\.[^/.]+$/, '');

export const replaceFile = async (oldPath: string, newPath: string) => {
    await fs.unlink(oldPath);
    await fs.rename(newPath, oldPath);
};
