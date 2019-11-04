const ExifImage = require('exif').ExifImage;
const sharp = require('sharp');
const piexif = require('piexifjs');
const fs = require('fs');
const { fork } = require('child_process');

const ConfigHandler = require('./ConfigHandler');
const { ACTIONS } = require('../workers/dirScanner');

const { SUPPORTED_FORMATS, REFRESH_INTERVAL, STARTER_SHUFFLE_PATH } = require('../constants');

const { promisify } = require('util');

/* At some point these could go in a helper file... */
const fsp = {
    readFile: promisify(fs.readFile),
    writeFile: promisify(fs.writeFile)
};

/**
 * Obj to build and manage the list
 */
class FileHandler {
    constructor (scanPath, postponeScan = false) {
        if (!postponeScan) this.init(scanPath);
        this.list = [];
        this.shuffled = [];
        this.fullPathsOnly = [];
        this.scanPath = scanPath;
        this.status = FileHandler.STATUS.INIT;
        this.config = null;

        this.refreshTimer = null;
        sharp.cache(false);
    }

    /**
     * Never let the refresh happen faster than once an hour
     */
    startRefreshInterval () {
        this.refreshTimer = setInterval(() => {
            this.init(this.config, true);
        }, Math.max(REFRESH_INTERVAL, 60 * 60 * 1000));
    }

    stopRefreshInterval () {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        this.refreshTimer = null;
    }

    setNewScanPath (scanPath) {
        this.scanPath = scanPath;
    }

    /**
     * Check whether or not the client is requesting a path that we sent them
     * @param {string} path 
     */
    validatePath (path) {
        return this.fullPathsOnly.indexOf(path) !== -1;
    }

    /**
     * Scan the directories and such, and filter as needed
     * @param {*} config 
     * @param {boolean} [skipVerify=false]
     */
    async init (config, skipVerify = false) {
        this.config = config;
        console.log('[FileHandler] Begin scanning');
        this.status = FileHandler.STATUS.SCANNING;
        let paths = await this.useWorker(ACTIONS.SCAN_DIR, { path: this.scanPath, excludes: config.exclude });
        let starterShuffle = await ConfigHandler.getStarterShuffle();
        if (!!starterShuffle) this.shuffled = await this.initWithStarterShuffle(paths, starterShuffle);
        console.log(`[FileHandler] ${paths.length} items found. Begin filtering`);
        this.status = FileHandler.STATUS.FILTERING;
        let filtered = await this.useWorker(ACTIONS.FILTER, { paths, formats: SUPPORTED_FORMATS });
        console.log('[FileHandler] after filter', filtered.length);
        if (!skipVerify && !starterShuffle) filtered = await this.useWorker(ACTIONS.VERIFY, filtered);
        if (!!starterShuffle) filtered = await this.useWorker(ACTIONS.VERIFY_AGAINST, { verified: this.shuffled, unverified: filtered });
        console.log('[FileHandler] after access check', filtered.length);
        if (!starterShuffle) this.shuffled = await this.useWorker(ACTIONS.SHUFFLE, filtered);
        console.log('[FileHandler] Shuffled list cached');
        this.status = FileHandler.STATUS.READY;
        this.list = filtered;
        this.fullPathsOnly = filtered.map(i => i.fullPath);
        console.log('[FileHandler] Filtered final list to length', filtered.length);
    }

    async initWithStarterShuffle (list, preShuffle) {
        let merged = await this.useWorker(ACTIONS.MERGE, { list, preShuffle });
        merged = await this.useWorker(ACTIONS.FILTER, { paths: merged, formats: SUPPORTED_FORMATS });
        // merged = await this.useWorker(ACTIONS.VERIFY, merged);
        // we should have a shuffled list now
        return merged;
    }

    async getNewShuffle () {
        const res = await this.useWorker(ACTIONS.SHUFFLE, this.list);
        return res;
    }

    /**
     * Call the worker process to do various scanning/filtering tasks
     * We don't want to block the main thread as the load can be intensive
     * @param {string} action 
     * @param {*} data 
     */
    async useWorker (action, data) {
        return new Promise(resolve => {
            let child = fork('./workers/dirScanner.js');
            child.send({ action, data });
            child.on('message', message => {
                if (message.error) {
                    console.log('\x1b[31m[useWorker] Error from worker', e.data, '\x1b[0m');
                    console.log('If it is a pathing error, please make sure all network paths specified are mounted.');
                    console.error(e, message.data);
                    process.exit();
                }
                resolve(message.data);
            });
        });
    }

    /**
     * Save a JSON of the shuffle order so it can persist through restarts
     */
    async dumpShuffle () {
        await fsp.writeFile(STARTER_SHUFFLE_PATH, JSON.stringify(this.shuffled));
        return;
    }

    /**
     * @param {number} index 
     */
    async shuffleAfter (index) {
        console.log('shuffling all after', index);
        let temp = this.shuffled.slice(0);
        let preserve = temp.splice(0, index);
        temp = await this.useWorker(ACTIONS.SHUFFLE, temp);
        let res = [...preserve, ...temp];
        this.shuffled = res;
        return res;
    }

    /**
     * @param {string} image 
     */
    static async getExif (image) {
        return new Promise(resolve => {
            new ExifImage({ image }, async (err, exif) => {
                let info;
                if (err) {
                    info = { message: `Could not read Exif data: ${err.message}` };
                } else {
                    info = exif.exif;
                    info.gps = exif.gps;
                    
                }
                resolve(info);
            });
        });
    }

    static async editImage (path, method) {
        return new Promise(resolve => {
            fs.access(path, fs.constants.W_OK, async err => {
                if (err) {
                    return resolve({ message: `Error: ${path}: ${err.message}` });
                }
                try {
                    console.log(`[FileHandler] ${method} request to ${path}`);
                    switch (method) {
                        case 'rotate':
                            const originalBuffer = await fsp.readFile(path);
                            const exifDump = piexif.load(originalBuffer.toString('binary'));
                            const rotatedBuffer = await sharp(path).rotate(90).toBuffer();
                            const finalBinary = piexif.insert(piexif.dump(exifDump), rotatedBuffer.toString('binary'));
                            await fsp.writeFile(path, new Buffer(finalBinary, 'binary'));
                            resolve({});
                            break;
                        default:
                            resolve({ message: `Error: unsupported method ${method}` });
                    }
                } catch (e) {
                    console.error(e);
                    resolve({ message: `Error processing image ${e.message}` });
                }
            });
        });
    }
}

FileHandler.STATUS = {
    INIT: 'FileHandler is in uninitiated state',
    SCANNING: 'Currently scanning file list',
    FILTERING: 'Currently filtering file list',
    READY: 'Ready'
};

module.exports = FileHandler;
