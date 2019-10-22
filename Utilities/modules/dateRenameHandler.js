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

const DIR_PATH = process.env.RENAME_PATH || '/Users/admin/Pictures/SamplePhone';

/**
 * The exposed method to handle incoming requests
 * @param {Request} req 
 * @param {Response} res 
 */
const handleRenames = async (req, res) => {
    try {
        const { path, execute, suffix, tryDetect } = req.body;
        const usePath = !!path && await verifyPath(path) ? path : undefined;
        const list = await buildList(usePath, { suffix, tryDetect });

        if (!execute) return res.send(list);

        const renamedNum = await renameList(list);
        return res.status(200).send(`Renamed ${renamedNum} items`);
    } catch (e) {
        console.error(e);
        return res.status(500).send(`Error with handle renames: ${e.message}`);
    }
};

/**
 * Construct the list of files with the project new names
 * @param {string} dir 
 * @param {{ suffix: boolean, tryDetect: boolean }} options
 * @returns {Array}
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
                const isDir = await isDirectory(filePath);
                result.push({
                    filePath,
                    isDir,
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
 * Actually rename files based on what's passed in from the buildList function
 * In the future, possible to connect socket to send back progress
 * @param {Array<{ filePath: string, name: string, isDir: boolean, info: *, newName: string }>} list 
 */
const renameList = async (list) => {
    // just replace name with newname
    // don't rename if dir = true or no change in name
    let count = 0;
    for (let i = 0; i < list.length; i++) {
        if (list[i].isDir || list[i].name === list[i].newName) continue;

        const newPath = (list[i].filePath).replace(list[i].name, list[i].newName);
        await fsp.rename(list[i].filePath, newPath);
        count++;
    }
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

buildList()

module.exports = {
    handleRenames
};