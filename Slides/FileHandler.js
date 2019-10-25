const { fork } = require('child_process');
const { ACTIONS } = require('./workers/dirScanner');

const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png'];
const STATUS = {
    INIT: '',
    SCANNING: '',
    FILTERING: '',
    READY: ''
};

/**
 * Obj to build and manage the list
 */
class FileHandler {
    constructor (scanPath, postponeScan = false) {
        if (!postponeScan) this.init(scanPath);
        this.list = [];
        this.scanPath = scanPath;
        this.status = STATUS.INIT;
    }

    async init () {
        console.log('[FileHandler] Begin scanning');
        this.status = STATUS.SCANNING;
        let paths = await this.useWorker(ACTIONS.SCAN_DIR, this.scanPath);
        console.log('[FileHandler] Begin filtering');
        this.status = STATUS.FILTERING;
        let filtered = await this.useWorker(ACTIONS.FILTER, { paths, formats: SUPPORTED_FORMATS });
        this.status = STATUS.READY;
        this.list = filtered;
        console.log('[FileHandler] Filtered list to length', filtered.length);
    }

    async useWorker (action, data) {
        return new Promise(resolve => {
            let child = fork('./workers/dirScanner.js');
            child.send({ action, data });
            child.on('message', message => {
                if (message.error) {
                    Logger.error('[applyMetaData] Error applying', e.data);
                    console.error(e, message.data);
                }
                resolve(message.data);
            });
        });
    }
}

module.exports = FileHandler;