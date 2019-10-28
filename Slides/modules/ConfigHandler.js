const fs = require('fs');
const { promisify } = require('util');
const { resolve: pathResolve } = require('path');

const { CONFIG_PATH, VER, STARTER_SHUFFLE_PATH } = require('../constants');

const fsp = {
    readFile: promisify(fs.readFile),
    rename: promisify(fs.rename)
};
const ENCODING = 'utf8';

class Config {
    constructor () {
        this.config = {
            basePath: process.env.SCAN_PATH,
            version: VER
        };
    }

    async load () {
        return new Promise(async (resolve, reject) => {
            try {
                let results = await fsp.readFile(pathResolve(__dirname, '..', CONFIG_PATH), ENCODING);
                let config = JSON.parse(results);
                this.config = Object.assign({}, this.config, config);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    getConfig () {
        return this.config;
    }

    /**
     * Preserve shuffle order from before, past server restarts
     */
    static getStarterShuffle () {
        return new Promise(async resolve => {
            try {
                const results = await fsp.readFile(pathResolve(__dirname, '..', STARTER_SHUFFLE_PATH), ENCODING);
                const config = JSON.parse(results);
                console.log(`[ConfigHandler] Loaded starter shuffle with ${config.length} results.`);
                try {
                    const pIndex = STARTER_SHUFFLE_PATH.lastIndexOf('.');
                    const newName = STARTER_SHUFFLE_PATH.substr(0, pIndex) + Date.now() + STARTER_SHUFFLE_PATH.substr(n);
                    await fsp.rename(STARTER_SHUFFLE_PATH, newName);
                } catch (e) {}
                
                resolve(config);
            } catch (e) {
                resolve();
            }
        })
    }
}

module.exports = Config;
