/**
 * @file dirScanner worker handles all the setup, constructing file lists
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { NAMES } = require('../constants');

const fsp = {
    readdir: promisify(fs.readdir),
    access: promisify(fs.access)
};

const NAMAE = `\x1b[33mworker-${NAMES[Math.floor(Math.random() * NAMES.length)]}\x1b[0m`;

/**
 * A return result of the scan
 * @typedef {Object} ScannedFile
 * @property {string} item
 * @property {string} fullPath
 * @property {string} add
 */

process.on('message', async message => {
    try {
        const { action, data } = message;
        let res;
        console.log(`[${NAMAE}] Worker live with action (${action})`);
        switch (action) {
            case ACTIONS.SCAN_DIR:
                const { path, excludes } = data;
                console.log('Begin scan with excludes', excludes)
                res = await scanDir(path, undefined, excludes);
                return sendReply(null, res);
            case ACTIONS.FILTER:
                const { paths, formats } = data;
                res = filterList(paths, formats);
                return sendReply(null, res);
            case ACTIONS.VERIFY:
                res = await verifyPaths(data);
                return sendReply(null, res);
            case ACTIONS.SHUFFLE:
                res = await shuffleList(data);
                return sendReply(null, res);
            case ACTIONS.MERGE:
                const { list, preShuffle } = data;
                res = await mergePreshuffled(list, preShuffle);
                return sendReply(null, res);
            default:
                return sendReply(null, `action ${action} not supported`);
        }
    } catch (e) {
        console.error(`[${NAMAE}] Error`, e);
        sendReply(e, e.message);
    }
});

const sendReply = (error, data) => {
    process.send({ error, data });
    close();
}

const close = () => {
    setTimeout(() => {
        console.log(`[${NAMAE}] 再見!`);
        process.exit();
    }, 1000);
};

/**
 * Create a new shuffle list based on a starter, adding new items
 * @param {ScannedFile[]} list 
 * @param {ScannedFile[]} preShuffle 
 */
const mergePreshuffled = async (list, preShuffle) => {
    let newItems = list.filter(file => !preShuffle.find(obj => obj.fullPath === file.fullPath));
    newItems = shuffleList(newItems);
    // console.log(newItems[425])
    console.log(`[${NAMAE}] Finished merge list with ${newItems.length} new items`);
    return preShuffle.concat(newItems);
};

/**
 * 
 * @param {Array<ScannedFile>} list 
 */
const verifyPaths = async (list) => {
    let newList = [];
    const onePercent = Math.floor(list.length / 100) + 1;
    for (let i = 0; i < list.length; i++) {
        if (i % onePercent === 0) console.log(`[${NAMAE}] Verified ${i}/${list.length} (${((i / list.length) * 100).toFixed(2)}%)`);
        let verified = await checkAccess(list[i].fullPath);
        if (verified) {
            newList.push(list[i]);
        } else {
            console.log(`[${NAMAE}] removed ${list[i].item} due to failed access`);
        }
    }
    return newList;
}

const checkAccess = async (path) => {
    return new Promise(resolve => {
        fs.access(path, fs.constants.R_OK, err => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

/**
 * Shufflein place with Fisher-Yates algorithm
 * @param {Array<any>} list 
 */
const shuffleList = (list) => {
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
};

/**
 * @param {ScannedFile[]} fileList 
 * @param {string[]} supported 
 */
const filterList = (fileList, supported) => {
    return fileList.filter(item => {
        if (item.item.indexOf('._') !== -1) return false;
        const ext = item.item.split('.').pop().toLowerCase();
        return supported.indexOf(ext) !== -1;
    });
};

/**
 * @param {string} basePath 
 * @param {string} add 
 * @param {Array<string>} excludes 
 */
const scanDir = async (basePath, add = '.', excludes) => {
    /** @type ScannedFile[] */
    let result = [];
    let dir = await fsp.readdir(basePath);
    console.log(`[${NAMAE}] Found ${dir.length} items in ${add}`);
    for (let i = 0; i < dir.length; i++) {
        let item = dir[i];
        if (await isDirectory(path.resolve(basePath, item))) {
            if (excludes && excludes.indexOf(item) !== -1) {
                console.log(`[${NAMAE}] Ignoring dir (${item})`);
                continue;
            }
            let sub = await scanDir(path.resolve(basePath, item), `${add}/${item}`, excludes);
            result.push(...sub);
        } else {
            result.push({
                item,
                fullPath: path.resolve(basePath, item),
                add
            });
        }
    }
    return result;
};

/**
 * Check if path os a directory
 * @param {string} filePath 
 */
const isDirectory = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.lstat(filePath, (err, stats) => {
            if (err) return reject(err);
            resolve(stats.isDirectory());
        });
    });
};

const ACTIONS = {
    SCAN_DIR: 'scanDir',
    FILTER: 'filter',
    SHUFFLE: 'shuffle',
    VERIFY: 'verify',
    MERGE: 'merge'
};

module.exports = {
    ACTIONS
};
