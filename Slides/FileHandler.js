const ExifImage = require('exif').ExifImage;
const { fork } = require('child_process');
const { ACTIONS } = require('./workers/dirScanner');

const { SUPPORTED_FORMATS } = require('./constants');

/**
 * Obj to build and manage the list
 */
class FileHandler {
    constructor (scanPath, postponeScan = false) {
        if (!postponeScan) this.init(scanPath);
        this.list = [];
        this.fullPathsOnly = [];
        this.scanPath = scanPath;
        this.status = FileHandler.STATUS.INIT;
    }

    setNewScanPath (scanPath) {
        this.scanPath = scanPath;
    }

    validatePath (path) {
        return this.fullPathsOnly.indexOf(path) !== -1;
    }

    async init (config) {
        console.log('[FileHandler] Begin scanning');
        this.status = FileHandler.STATUS.SCANNING;
        let paths = await this.useWorker(ACTIONS.SCAN_DIR, { path: this.scanPath, excludes: config.exclude });
        console.log(`[FileHandler] ${paths.length} items found. Begin filtering`);
        this.status = FileHandler.STATUS.FILTERING;
        let filtered = await this.useWorker(ACTIONS.FILTER, { paths, formats: SUPPORTED_FORMATS });
        console.log('[FileHandler] after filter', filtered.length);
        filtered = await this.useWorker(ACTIONS.VERIFY, filtered);
        console.log('[FileHandler] after access check', filtered.length);
        this.status = FileHandler.STATUS.READY;
        this.list = filtered;
        this.fullPathsOnly = filtered.map(i => i.fullPath);
        console.log('[FileHandler] Filtered final list to length', filtered.length);
    }

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
