const ExifImage = require('exif').ExifImage;
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const moment = require('moment');

const { DEFAULT_FORMAT } = require('../constants');
const { isDirectory, verifyPath } = require('../tools');

const fsp = {
    readdir: promisify(fs.readdir),
    rename: promisify(fs.rename),
    stat: promisify(fs.stat)
};

const CACHE_TIME = 2 * 60 * 1000;
const DIR_PATH = process.env.RENAME_PATH || '/Users/admin/Pictures/SamplePhone';

let taskRunning = false;
let cache = {};

/**
 * The exposed method to handle incoming requests
 * @param {Request} req 
 * @param {Response} res 
 */
const handleRenames = async (req, res) => {
    if (taskRunning) return res.status(500).send('Task is already running');
    try {
        const { path, execute, suffix, tryDetect } = req.body;
        const usePath = !!path && await verifyPath(path) ? path : undefined;

        const cached = cache[makeCacheKey(usePath, suffix, tryDetect)];

        const list = cached ? cached : await buildList(usePath, { suffix, tryDetect });
        if (!cached) cacheList(usePath, suffix, tryDetect, list);

        if (!execute) return res.status(200).send(list);

        const renamedNum = await renameList(list);
        return res.status(200).send(`Renamed ${renamedNum} items`);
    } catch (e) {
        console.error(e);
        return res.status(500).send(`Error with handle renames: ${e.message}`);
    }
};

/**
 * Put the list into memory for a short time so if execute is called shortly after, no re-scan
 * @param {*} path 
 * @param {*} suffix 
 * @param {*} tryDetect 
 * @param {*} results 
 */
const cacheList = (path, suffix, tryDetect, results) => {
    const key = makeCacheKey(path, suffix, tryDetect);
    cache[key] = results;
    setTimeout(() => delete cache[key], CACHE_TIME);
};

/**
 * Make a string out of the keys
 * @param {*} path 
 * @param {*} suffix 
 * @param {*} tryDetect 
 */
const makeCacheKey = (path, suffix, tryDetect) => {
    return path + suffix + tryDetect;
}

/**
 * Construct the list of files with the project new names
 * @param {string} dir 
 * @param {{ suffix: boolean, tryDetect: boolean }} options
 * @returns {Array}
 */
const buildList = (dir = DIR_PATH, options = {}) => {
    return new Promise(async (resolve, reject) => {
        taskRunning = true;
        try {
            let pathList = await fsp.readdir(dir);
            console.log(`[DateRenameHandler] Path list found ${pathList.length} items`);
            const onePercent = Math.floor(pathList.length / 100) + 1;
    
            for (let i = 0; i < pathList.length; i++) {
                if (i % onePercent === 0) console.log(`[DateRenameHandler] Processed ${i}/${pathList.length} (${((i / pathList.length) * 100).toFixed(2)}%)`);
                const filePath = path.resolve(dir, pathList[i]);
                const info = await returnItemData(filePath);
                const formattedDate = infoToFormatted(info);
                const skipRenamed = options.tryDetect ? tryDetectDate(pathList[i]) : false;
                const isDir = await isDirectory(filePath);
                pathList[i] = {
                    filePath,
                    isDir,
                    name: pathList[i],
                    newName: skipRenamed ? pathList[i] : (
                        options.suffix ? getSuffixedName(pathList[i], formattedDate) : `${formattedDate}_${pathList[i]}`
                    )
                };
            }
            console.log(`[DateRenameHandler] Done scanning.`);
            taskRunning = false;
            resolve(pathList);
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Actually rename files based on what's passed in from the buildList function
 * In the future, possible to connect socket to send back progress
 * @param {Array<{ filePath: string, name: string, isDir: boolean, newName: string }>} list 
 */
const renameList = async (list) => {
    let count = 0;
    taskRunning = true;
    for (let i = 0; i < list.length; i++) {
        if (list[i].isDir || list[i].name === list[i].newName) continue;

        const newPath = (list[i].filePath).replace(list[i].name, list[i].newName);
        await fsp.rename(list[i].filePath, newPath);
        count++;
    }
    taskRunning = false;
    return count;
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
    let res1 = fileName.match(/\d{1,2}\D\d{1,2}\D(\d{4}|\d{2})/g);
    return res1.length > 0;
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

module.exports = {
    handleRenames
};
