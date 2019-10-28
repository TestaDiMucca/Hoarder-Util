const fs = require('fs');
const { promisify } = require('util');
const { resolve: pathResolve } = require('path');

const { CONFIG_PATH, VER, STARTER_SHUFFLE_PATH } = require('../constants');

const fsp = {
    readFile: promisify(fs.readFile)
};
const ENCODING = 'utf8';

class Config {
    constructor () {
        this.config = {};
    }

    async load () {
        return new Promise(async (resolve, reject) => {
            try {
                let results = await fsp.readFile(pathResolve(__dirname, '..', CONFIG_PATH), ENCODING);
                let config = JSON.parse(results);
                let other = {
                    basePath: process.env.SCAN_PATH,
                    version: VER
                };
                this.config = Object.assign(config, other);
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
                resolve(config);
            } catch (e) {
                resolve();
            }
        })
    }
}

module.exports = Config;
