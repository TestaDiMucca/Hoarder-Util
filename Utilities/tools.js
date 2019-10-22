const fs = require('fs-extra');

/**
 * See if the path is accessible
 * @param {string} path 
 * @return {Promise<boolean>}
 */
const verifyPath = (path) => {
    return new Promise(resolve => {
        fs.access(path, error => {
            if (!error) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

/**
 * See if the path points to a directory or a file
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

/**
 * 
 * @param {string} src 
 * @param {string} dest 
 */
const moveFile = async (src, dest) => {
    await fs.move(src, dest);
};

/**
 *
 * @param {string} src
 * @param {string} dest
 */
const copyFile = async (src, dest) => {
    await fs.copy(src, dest, { preserveTimestamps: true });
};

module.exports = {
    moveFile,
    copyFile,
    isDirectory,
    verifyPath
};