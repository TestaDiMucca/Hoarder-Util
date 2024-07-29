import * as fs from 'fs/promises';

import * as fileops from '@common/fileops';

export const replaceExtension = fileops.replaceExtension;

/**
 * Write edited files to a temp filename so we don't mess with the original
 */
export const getTempName = fileops.getTempName;

export const removeExt = fileops.removeExt;

export const checkPathExists = async (path: string) => {
    try {
        await fs.stat(path);
        return true;
    } catch {
        return false;
    }
};

export const replaceFile = fileops.replaceFile;

export const validDirectoryPath = async (dir: string) => {
    try {
        const stats = await fs.stat(dir);

        return stats.isDirectory();
    } catch (e) {
        return false;
    }
};

export const getFileList = (dir: string) => fs.readdir(dir);
