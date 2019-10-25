const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const fsp = {
    readdir: promisify(fs.readdir)
};

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
        switch (action) {
            case ACTIONS.SCAN_DIR:
                res = await scanDir(data);
                return sendReply(null, res);
            case ACTIONS.FILTER:
                const { paths, formats } = data;
                res = filterList(paths, formats);
                return sendReply(null, res);
            case ACTIONS.SHUFFLE:
                res = shuffleList(data);
                return sendReply(null, res);
            default:
                sendReply(null, `action ${action} not supported`);
        }
        close();
    } catch (e) {
        console.error('[worker] Error', e);
        sendReply(e, e.message);
    }
});

const sendReply = (error, data) => {
    process.send({ error, data });
}

const close = () => {
    setTimeout(() => {
        console.log('[worker] 再見!');
        process.exit();
    }, 1000);
};

/**
 * Shufflein place with Fisher-Yates algorithm
 * @param {Array<any>} list 
 */
const shuffleList = (list) => {
    var j, x, i;
    for (i = list.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = list[i];
        list[i] = list[j];
        list[j] = x;
    }
    return a;
};

/**
 * @param {ScannedFile[]} fileList 
 * @param {string[]} supported 
 */
const filterList = (fileList, supported) => {
    return fileList.filter(item => {
        const ext = item.item.split('.').pop();
        delete item.add; /* Delete add, don't need it */
        return supported.indexOf(ext) !== -1;
    });
};

const scanDir = async (basePath, add = '.') => {
    /** @type ScannedFile[] */
    let result = [];
    let dir = await fsp.readdir(basePath);
    for (let i = 0; i < dir.length; i++) {
        let item = dir[i];
        if (await isDirectory(path.resolve(basePath, item))) {
            let sub = await scanDir(path.resolve(basePath, item), `${add}/${item}`);
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
    SHUFFLE: 'shuffle'
};

module.exports = {
    ACTIONS
};