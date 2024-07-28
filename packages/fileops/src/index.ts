import path from 'path';
import fs from 'fs/promises';
import dateFormat from 'dateformat';

import { printf, chunkArray, promises, randomFromArray, withTimer } from '@common/common';
import { ExifResult } from './types';

const ExifImage = require('exif').ExifImage;

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

export const splitFileNameFromPath = (filePath: string) => {
    const SPLIT_CHAR = '/';
    const split = filePath.split(SPLIT_CHAR);
    const fileName = split.pop();
    return {
        fileName,
        rootPath: split.join(SPLIT_CHAR),
    };
};

/** General utility methods carried from common */
export const utils = {
    promises,
    randomFromArray,
    chunkArray,
    withTimer,
};
