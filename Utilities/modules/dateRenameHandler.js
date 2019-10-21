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
 */
const buildList = (dir = DIR_PATH) => {
    return new Promise(async (resolve, reject) => {
        try {
            const pathList = await fsp.readdir(dir);
    
            let result = [];
            for (let i = 0; i < pathList.length; i++) {
                const filePath = path.resolve(dir, pathList[i]);
                const info = await returnItemData(filePath);
                const formattedDate = infoToFormatted(info);
                let file = {
                    filePath,
                    info,
                    name:  pathList[i]
                };
                result.push(file);
                console.log(filePath, formattedDate);
            }
            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
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
    // return new Promise((resolve, reject) => {
    //     fs.stat(filePath, (err, stats) => {
    //         if (err) return reject(err);
    //         resolve(stats);
    //     });
    // });
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

const infoToFormatted = (info, format = DEFAULT_FORMAT) => {
    const useDate = info.CreateDate ? makeDash(info.CreateDate) : info.mtime;
    const mmnt = moment(useDate);
    return mmnt.format(format);
};

buildList()
