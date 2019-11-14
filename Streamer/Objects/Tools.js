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
}

module.exports = new Tools();