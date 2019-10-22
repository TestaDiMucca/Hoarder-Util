const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { moveFile, copyFile } = require('../tools');

const fsp = {
    readdir: promisify(fs.readdir)
};

const {
    isDirectory,
    verifyPath
} = require('../tools');

const originPath = process.env.MIGRATE_FROM_PATH || path.resolve(__dirname, '../junk1');
const destinationPath = process.env.MIGRATE_TO_PATH || path.resolve(__dirname, '../junk2');

/**
 * A return result of the scan
 * @typedef {Object} ScannedFile
 * @property {string} item
 * @property {string} fullPath
 * @property {string} add
 */

/**
 * Actual handler
 * @param {Request} req 
 * @param {Response} res 
 */
const handleMigration = async (req, res) => {
    try {
        const { origin, destination, copy } = req.body;
        if ((!!origin && await verifyPath(origin) === false) || (!!destination && await verifyPath(destination) === false)) {
            throw { message: 'Bad paths provided!' };
        }

        const fileList = await scanDir(origin || originPath);
        const results = await executeMigrate(fileList, destination || destinationPath, !!copy ? false : true);

    } catch (e) {
        console.error(e);
        res.status(500).send(`Error on migrate: ${e.message}`);
    }
};

/**
 * 
 * @param {string} basePath 
 * @param {string} add 
 * @returns {Promise<ScannedFile[]>}
 */
const scanDir = async (basePath, add = '') => {
    /** @type ScannedFile[] */
    let result = [];
    let dir = await fsp.readdir(basePath);
    for (let i = 0; i < dir.length; i++) {
        let item = dir[i];
        if (await isDirectory(path.resolve(basePath, item))) {
            let sub = await scanDir(path.resolve(basePath, item), `${add}/${item}`);
            result.concat(sub);
        } else {
            result.push({
                item,
                fullPath: path.resolve(basePath, item),
                add
            });
        }
    }
    console.log(result)
    return result;
};

/**
 * 
 * @param {ScannedFile[]} fileList 
 * @param {string} destination
 * @param {boolean} [move=true] 
 */
const executeMigrate = async (fileList, destination, move = true) => {
    const useFnc = move ? moveFile : copyFile;
    let migrated = 0;
    for (let i = 0; i < fileList.length; i++) {
        try {
            const dest = path.resolve(destinationPath, fileList[i].add, fileList[i].item);
            console.log('move', fileList[i].fullPath, dest);
        } catch (e) {
            console.error(e);
        }
    }
};

module.exports = {
    handleMigration
};