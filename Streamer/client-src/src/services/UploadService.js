import io from 'socket.io-client';
import socketStream from 'socket.io-stream/socket.io-stream';
// import fileReaderStream from 'filereader-stream';

import { SERVER } from '../helpers/constants';

socketStream.forceBase64 = true;
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

            socket.on('ready', async () => {
                console.log('[UploadService] Server ready to receive data');
                try {
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
        return new Promise(resolve => {
            if (!file) resolve();

            console.log('[UploadService] Uploading', file.name);
            const name = file.name;
            let packetNo = 0;

            let self = this;

            // let readStream = fileReaderStream(file);
            parseFile(file, chunk => {
                console.log('on chunk', packetNo);
                self.socket.emit('chunk', { chunk, name, packetNo, type });
                packetNo ++;
            }, progress => {
                    if (self.callback) self.callback(`Uploading ${partname}.`, progress);
            }, () => {
                console.log('done');
                resolve();
            });

            // readStream.on(data => console.log('on data'));

            // let stream = socketStream.createStream();
            // let size = 0;
            // socketStream(this.socket).emit(type, stream, { size: file.size, name: file.name });
            
            // let blobStream = socketStream.createBlobReadStream(file, { objectMode: true, highWaterMark: 1024 * 1024 });

            // blobStream.on('data', chunk => {
            //     size += chunk.length;
            //     if (this.callback) this.callback(`Uploading ${partname}.`, Math.floor(size / file.size * 100));
            // }).on('end', () => {
            //     console.log('stream end')
            //     resolve();
            // }).on('close', () => {
            //     console.log('stream close')
            // }).on('pause', () => {
            //     console.log('stream paus')
            // }).on('resume', () => {
            //     console.log('stream resume')
            // }).on('error', err => console.log(err));
            // blobStream.pipe(stream);
        });
    }

    cancel () {
        console.log('[UploadHandler] Clearing jobs');
        if (this.socket) this.socket.close();
        this.emptyKeys();
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

    // let buff;
    var readEventHandler = function (evt) {
        if (evt.target.error == null) {
            offset += chunkSize;
            callback(evt.target.result); // callback for handling read chunk
            // buff.push(evt.target.result);
            // buff = buff ? _appendBuffer(buff, evt.target.result) : evt.target.result;
            if (onProgress) onProgress(Math.floor((offset / fileSize) * 100));
        } else {
            
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (offset >= fileSize) {
            // callback(buff);
            console.log("Done reading file");
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
