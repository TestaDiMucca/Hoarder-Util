import io from 'socket.io-client';

import { SERVER } from '../helpers/constants';

class UploadService {
    constructor () {
        this.emptyKeys();
    }

    emptyKeys () {
        this.season = null;
        this.show = null;
        this.bannerFile = null;
        this.mediaFiles = null;

        this.socket = null;
        this.callback = null;
    }

    /**
     * @param {string} season 
     * @param {string} show 
     * @param {FileList} bannerFile 
     * @param {FileList} mediaFiles 
     */
    newJob (season, show, bannerFile, mediaFiles) {
        console.log('[UploadService] Instantiating job.');
        this.season = season > 0 ? `Season ${season}` : null;
        this.show = show;
        this.bannerFile = bannerFile ? bannerFile[0] : null;
        this.mediaFiles = mediaFiles || [];
        return this;
    }

    upload () {
        return new Promise((resolve, reject) => {
            if (!!socket) return reject(new Error('Upload already in progress'));
            let socket = io.connect(SERVER);
            this.socket = socket;
            socket.on('connect', () => {
                console.log('[UploadService] Sending init data to server');
                socket.emit('init', {
                    show: this.show,
                    season: this.season
                });
            });
            let jobGoing = false;

            socket.on('ready', async () => {
                if (jobGoing) return;
                console.log('[UploadService] Server ready to receive data');
                try {
                    jobGoing = true;
                    await this.uploadToServer(this.bannerFile, 'thumb', 'thumbnail banner image');
                    for (let i = 0; i < this.mediaFiles.length; i++) {
                        await this.uploadToServer(this.mediaFiles[i], 'media', `(${i + 1}/${this.mediaFiles.length}): ${this.mediaFiles[i].name}`);
                    }
                    this.cancel();
                    resolve();
                } catch (e) {
                    console.log('Upload Error', e);
                    reject(e);
                }
            });
        });
    }   

    /**
     * @param {File} file 
     * @param {string} type Upload type sent to server
     * @param {string} partname For display purposes on progress update
     */
    uploadToServer (file, type, partname) {
        return new Promise(async resolve => {
            if (!file) return resolve();

            console.log('[UploadService] Uploading', file.name);
            const name = file.name;
            let packetNo = 0;
            await this.prepareServer(name, type);
            let self = this;
            let complete = false;

            parseFile(file, chunk => {
                if (!self.socket) return;
                self.socket.emit('chunk', { chunk, name, packetNo, type });
                packetNo++;
            }, progress => {
                if (self.callback && !complete) self.callback(`Uploading ${partname}.`, progress);
            }, () => {
                self.socket.on('doneWriting', no => {
                    if (no + 1 >= packetNo) {
                        complete = true;
                        self.socket.off('doneWriting');
                        resolve();
                    }
                });
                
            });
        });
    }

    /**
     * Get the server ready to write the file
     * @param {string} name 
     * @param {string} type 
     */
    prepareServer (name, type) {
        return new Promise(resolve => {
            this.socket.emit('prepare', { name, type });
            this.socket.on('prepared', () => {
                this.socket.off('prepared');
                resolve();
            });
        });
    }

    /**
     * 
     * @param {boolean} [sendToServer=false]
     */
    cancel (sendToServer = false) {
        setTimeout(() => {
            if (sendToServer && this.socket) this.socket.emit('cancel', {});
            console.log('[UploadHandler] Clearing jobs');
            if (this.socket) this.socket.close();
            this.emptyKeys();
        }, 5000);   
    }

    /**
     * @param {function(string, number)} callback Return curr progress and %
     */
    onProgress (callback) {
        if (callback instanceof Function) this.callback = callback;
        return this;
    }
};

/**
 * 
 * @param {File} file 
 * @param {function(*)} callback 
 * @param {function(number)} onProgress 
 * @param {function()} onDone 
 * https://stackoverflow.com/questions/14438187/javascript-filereader-parsing-long-file-in-chunks
 */
function parseFile(file, callback, onProgress, onDone) {
    var fileSize = file.size;
    var chunkSize = 64 * 1024; // bytes
    var offset = 0;
    var self = this; // we need a reference to the current object
    var chunkReaderBlock = null;

    var readEventHandler = function (evt) {
        if (evt.target.error == null) {
            offset += chunkSize;
            callback(evt.target.result); // callback for handling read chunk
            if (onProgress) onProgress(Math.floor((offset / fileSize) * 100));
        } else {
            
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (offset >= fileSize) {
            if (onDone) onDone();
            return;
        }

        // of to the next chunk
        chunkReaderBlock(offset, chunkSize, file);
    }

    chunkReaderBlock = function (_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = readEventHandler;
        r.readAsArrayBuffer(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
}

export default new UploadService();
