import path from 'path';
import fs from 'fs/promises';
import dateFormat from 'dateformat';

import { printf, chunkArray, promises, randomFromArray, withTimer } from '@common/common';
import { ExifResult } from './types';
import { writeTags, readTags } from './ffmeta';

const ExifImage = require('exif').ExifImage;

/**
 * Write edited files to a temp filename so we don't mess with the original
 */
export const getTempName = (fileName: string): string => {
    const split = fileName.split('.');
    split[split.length - 2] = `${split[split.length - 2]}_tmp`;
    return split.join('.');
};

/** Media files we'll operate on for the date rename util */
export const DATETAG_SUPPORTED_EXTENSIONS: Record<'img' | 'mov', string[]> = {
    img: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
    mov: ['mov', 'mp4', 'webm', 'gif'],
};

/** Test method to confirm import and usage of common library */
export const printfExtended = (message: string) => printf(message);

/** Get date created for a file */
export const getDateCreated = async (filePath: string) => {
    const stat = await fs.stat(filePath);

    return stat.ctime;
};

/** Get filename from a path */
export const getExt = (fileName: string) => path.extname(fileName).replace(/\./g, '').toLowerCase();

/** Check if an ext matches something we can handle */
export const checkSupportedExt = (ext: string, categories: Array<keyof typeof DATETAG_SUPPORTED_EXTENSIONS>) =>
    categories.some((cat) => DATETAG_SUPPORTED_EXTENSIONS[cat].includes(ext.toLowerCase()));

/**
 * Turn two colons in a date to dashes. This makes it parseable for Date()
 * @param date A date in format such as "2017:07:14 00:00:00" as returned by EXIF
 */
export const exifToJsDate = (date: string) => {
    let n = 0;
    const N = 1;
    return date.replace(/:/g, (match) => (n++ <= N ? '-' : match)).replace(' ', ':');
};

/** Extract Exif data from an image given a path. */
export const getExif = (image: string): Promise<Date | null> =>
    new Promise((resolve) => {
        new ExifImage({ image }, (err: Error, exif: ExifResult) => {
            if (err) resolve(null);

            const originalDate = exif?.exif?.DateTimeOriginal;
            const converted = originalDate ? exifToJsDate(originalDate) : null;

            resolve(originalDate && converted ? new Date(converted) : null);
        });
    });

/**
 * Formats to: 'yy-MM-DD-HH-mm'
 *
 * @todo create options
 */
export const formatDateString = (date: Date, mask = 'yy-mm-dd-HH-MM_') => {
    try {
        return dateFormat(date, mask);
    } catch (e: any) {
        console.error(`Error formatting dates: ${e.message}`);
    }
};

/** Generates a date string given a file's path */
export const getDateStringForFile = async (
    fullPath: string,
    useExif = false,
    mask?: string
): Promise<{ dateStr?: string; exifUsed?: boolean }> => {
    const exifDate = useExif ? await getExif(fullPath) : null;
    const metaDate = await getDateCreated(fullPath);

    /** No dates read at all, won't modify */
    if (!exifDate && !metaDate) return {};

    const dateStr = formatDateString(exifDate ?? metaDate, mask);

    return {
        dateStr,
        exifUsed: !!exifDate,
    };
};

/**
 * Split a file path into its directory and the file itself's name
 */
export const splitFileNameFromPath = (filePath: string) => {
    const SPLIT_CHAR = '/';
    const split = filePath.split(SPLIT_CHAR);
    const fileName = split.pop();
    return {
        fileName,
        rootPath: split.join(SPLIT_CHAR),
    };
};

export const checkDirectoryExists = async (directoryPath: string) => {
    try {
        await fs.access(directoryPath);
        return true;
    } catch {
        return false;
    }
};

export const patternToTags = (pattern: string): string[] | undefined =>
    pattern.match(/%(.*?)%/g)?.map((s) => s.replace(/%/g, ''));

/**
 * Does weird reg-ex-y matching stuff
 * Returns null if it fails
 */
export const parseStringToTags = (pattern: string, input: string): null | Record<string, string> => {
    const tagNames = patternToTags(pattern);

    if (!tagNames) return null;

    const inputMatcherRegExp = new RegExp(pattern.replace(/%(.*?)%/g, '(.*?)') + '$');
    const extractedMatches = input.match(inputMatcherRegExp)?.slice(1);

    if (!extractedMatches) return null;

    return tagNames.reduce<Record<string, string>>((tags, tagName, i) => {
        tags[tagName] = extractedMatches[i];
        return tags;
    }, {});
};

/**
 * Get date metadata times for a file and apply them back when performing file op
 * It is assumed the callback will modify or replace the file specified by the path
 */
export const withUTimes = async <T>(cb: () => Promise<T>, filePath: string) => {
    let meta: null | Awaited<ReturnType<typeof fs.stat>> = null;

    try {
        meta = await fs.stat(filePath);
    } catch (e: any) {
        console.error(`[withUTimes] could not get metadata on file to apply: ${e.message}`);
    }

    const res = await cb();

    if (meta) await fs.utimes(filePath, meta.atime, meta.mtime);

    return res;
};

export const ffMeta = {
    writeTags,
    readTags,
};

export const replaceExtension = (fileName: string, ext: string) =>
    path.join(path.dirname(fileName), path.basename(fileName, path.extname(fileName)) + '.' + ext);

export const removeExt = (s: string) => s.replace(/\.[^/.]+$/, '');

export const replaceFile = async (oldPath: string, newPath: string) => {
    await fs.unlink(oldPath);
    await fs.rename(newPath, oldPath);
};

/** General utility methods carried from common */
export const utils = {
    promises,
    randomFromArray,
    chunkArray,
    withTimer,
};
