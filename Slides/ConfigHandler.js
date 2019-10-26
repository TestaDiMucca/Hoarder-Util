const fs = require('fs');
const { promisify } = require('util');
const { resolve: pathResolve } = require('path');

const { CONFIG_PATH, VER } = require('./constants');

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
                let results = await fsp.readFile(pathResolve(__dirname, CONFIG_PATH), ENCODING);
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
}

module.exports = Config;
