const fs = require('fs');
const { promisify } = require('util');

const fsp = {
    readdir: promisify(fs.readdir),
    lstat: promisify(fs.lstat),
    unlink: promisify(fs.unlink),
    rmdir: promisify(fs.rmdir)
};

/**
 * A toolbox
 * We can memoize in the future as this is a singleton
 */
class Tools {
    /**
     * From Matthias Hagers' blog
     * @param {string} string 
     */
    toCamelCase(string) {
        return string.replace(/([-_][a-z])/ig, ($1) => {
            return $1.toUpperCase()
                .replace('-', '')
                .replace('_', '');
        });
    }

    /**
     * Naming convention of SQL seems to use underscrore. Wrap to camelCase for Node use.
     * @param {*} row 
     */
    processRow(row) {
        if (!this.isObject(row)) return row;

        let result = {};
        for (let key in row) {
            result[this.toCamelCase(key)] = row[key];
        }
        return result;
    }

    /**
     * Check if something is an object or not.
     * @param {*} o 
     */
    isObject(o) {
        return o === Object(o) && !Array.isArray(o) && typeof o !== 'function';
    };

    /**
     * 
     * @param {*} path 
     * @param {*} newExt 
     */
    replaceExtension (path, newExt) {
        let split = path.split('.');
        split[split.length - 1] = newExt;
        return split.join('.');
    };

    /**
     * 
     * @param {*} path 
     */
    getExtension (path) {
        const split = path.split('.');
        return split[split.length - 1];
    };

    /**
     * Remove a directory recursively
     * @param {string} path 
     */
    async removeDirectory (path) {
        let deleted = 0;
        if (fs.existsSync(path)) {
            for (let entry of await fsp.readdir(path)) {
                const curPath = path + "/" + entry;
                if ((await fsp.lstat(curPath)).isDirectory())
                    deleted += await this.removeDirectory(curPath);
                else {
                    await fsp.unlink(curPath);
                    deleted++;
                }
            }
            await fsp.rmdir(path);
        }
        return deleted;
    }
}

module.exports = new Tools();