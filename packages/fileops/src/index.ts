import path from 'path';
import fs from 'fs/promises';
import dateFormat from 'dateformat';

import { printf, chunkArray, promises, randomFromArray, withTimer } from '@common/common';

import { writeTags, readTags, compressVideo } from './ffmeta';
import { getExif } from './imgTools';

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
export const checkSupportedExt = (
    input: string,
    categories: Array<keyof typeof DATETAG_SUPPORTED_EXTENSIONS>,
    pluckExt = false
) =>
    categories.some((cat) =>
        DATETAG_SUPPORTED_EXTENSIONS[cat].includes((pluckExt ? getExt(input) : input).toLowerCase())
    );

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

    if (split.length < 1) throw new Error('Invalid name');

    const fileName = split.pop()!;
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

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0B';

    const sizes = ['b', 'kb', 'mb', 'gb', 'tb'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    const value = bytes / Math.pow(1024, i);
    const formattedValue = value.toFixed(i === 0 ? 0 : 1); // No decimals for bytes

    return `${formattedValue} ${sizes[i]}`;
};

export function getFileSize(filePath: string, format?: 'string'): Promise<string>;
export function getFileSize(filePath: string, format: 'number'): Promise<number>;
export async function getFileSize(filePath: string, format?: 'string' | 'number'): Promise<number | string> {
    const meta = await fs.stat(filePath);

    if (format === 'number') return meta.size;

    return formatBytes(meta.size ?? 0);
}

export const ffMeta = {
    writeTags,
    readTags,
    compressVideo,
};

export { getTempName, removeExt, replaceExtension, replaceFile } from './util';
export { compressToLevel, exifToJsDate, getExif, extractText, searchForTextInImage } from './imgTools';

/** General utility methods carried from common */
export const utils = {
    promises,
    randomFromArray,
    chunkArray,
    withTimer,
};
