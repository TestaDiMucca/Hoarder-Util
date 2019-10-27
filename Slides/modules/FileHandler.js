const ExifImage = require('exif').ExifImage;
const { fork } = require('child_process');
const { ACTIONS } = require('../workers/dirScanner');

const { SUPPORTED_FORMATS, REFRESH_INTERVAL } = require('../constants');

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
    }

    /**
     * Never let the refresh happen faster than once an hour
     */
    startRefreshInterval () {
        this.refreshTimer = setInterval(() => {
            this.init(this.config);
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
     */
    async init (config) {
        this.config = config;
        console.log('[FileHandler] Begin scanning');
        this.status = FileHandler.STATUS.SCANNING;
        let paths = await this.useWorker(ACTIONS.SCAN_DIR, { path: this.scanPath, excludes: config.exclude });
        console.log(`[FileHandler] ${paths.length} items found. Begin filtering`);
        this.status = FileHandler.STATUS.FILTERING;
        let filtered = await this.useWorker(ACTIONS.FILTER, { paths, formats: SUPPORTED_FORMATS });
        console.log('[FileHandler] after filter', filtered.length);
        filtered = await this.useWorker(ACTIONS.VERIFY, filtered);
        console.log('[FileHandler] after access check', filtered.length);
        this.shuffled = await this.useWorker(ACTIONS.SHUFFLE, filtered);
        console.log('[FileHandler] Shuffled list cached');
        this.status = FileHandler.STATUS.READY;
        this.list = filtered;
        this.fullPathsOnly = filtered.map(i => i.fullPath);
        console.log('[FileHandler] Filtered final list to length', filtered.length);
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
                    
                }
                resolve(info);
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
