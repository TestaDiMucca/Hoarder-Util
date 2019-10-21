const ExifImage = require('exif').ExifImage;
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const moment = require('moment');

const { DEFAULT_FORMAT } = require('../constants');

const fsp = {
    readdir: promisify(fs.readdir),
    stat: promisify(fs.stat)
};

const DIR_PATH = process.env.RENAME_PATH || '/Users/admin/Pictures/SamplePhone';

/**
 * Construct the list of files with the project new names
 * @param {string} dir 
 * @param {{ suffix: boolean, tryDetect: boolean }} options
 */
const buildList = (dir = DIR_PATH, options = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pathList = await fsp.readdir(dir);
    
            let result = [];
            for (let i = 0; i < pathList.length; i++) {
                const filePath = path.resolve(dir, pathList[i]);
                const info = await returnItemData(filePath);
                const formattedDate = infoToFormatted(info);
                const skipRenamed = options.tryDetect ? tryDetectDate(pathList[i]) : false;
                result.push({
                    filePath,
                    info,
                    name: pathList[i],
                    newName: skipRenamed ? pathList[i] : (
                        options.suffix ? getSuffixedName(pathList[i], formattedDate) : `${formattedDate}_${pathList[i]}`
                    )
                });
            }
            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Insert something at the end of filename with extension
 * @param {string} original 
 * @param {string} insert 
 */
const getSuffixedName = (original, insert) => {
    const ind = original.lastIndexOf('.');
    return ind > 0 ? original.substr(0, ind) + '_' + insert + original.substr(ind) : `${original}_${insert}`;
};

/**
 * Try and see if this file has already been named before
 * @param {string} fileName 
 */
const tryDetectDate = (fileName) => {
    let res1 = fileName.match(/\d{2}([\/.-])\d{2}\1\d{4}/g) || [];
    let res2 = fileName.match(/\d{4}([\/.-])\d{2}\1\d{2}/g) || [];
    let res3 = fileName.match(/\d{2}([\/.-])\d{2}\1\d{2}/g) || [];
    return res1.length > 0 || res2.length > 0 || res3.length > 0;
};

/**
 * Get the modified/created date for the objects. Mostly images.
 * @param {string} image Path to the file to scan
 */
const returnItemData = (image) => {
    return new Promise(resolve => {
        new ExifImage({ image }, async (err, exif) => {
            let info;
            if (err) {
                info = await getDateModified(image);
            } else {
                info = exif.exif;
            }
            resolve(info);
        });
    });
};

/**
 * Get the date modified from FS if there is no EXIF Data
 * @param {string} filePath 
 */
const getDateModified = (filePath) => {
    return fsp.stat(filePath);
};

/**
 * Turn two colons in a date to dashes. This makes it parseable for Date()
 * @param {string} date A date in format such as "2017:07:14 00:00:00" as returned by EXIF
 */
const makeDash = (date) => {
    let n = 0;
    const N = 2;
    return date.replace(/:/g, match => n++ <= N ? '-' : match);
};

/**
 * Take the gathered info and distill it to a formatted date string
 * @param {fs.Stats | Exif.ExifData} info 
 * @param {string} format 
 */
const infoToFormatted = (info, format = DEFAULT_FORMAT) => {
    const useDate = info.CreateDate ? makeDash(info.CreateDate) : info.mtime;
    const mmnt = moment(useDate);
    return mmnt.format(format);
};
