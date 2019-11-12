const io = require('socket.io');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const socketStreamer = require('socket.io-stream');
socketStreamer.forceBase64 = true;

const { THUMB_PATH } = require('../constants');

const fsp = {
    mkdir: promisify(fs.mkdir)
};
const basePath = process.env.SCAN_PATH || './';

class UploadHandler {
    constructor () {
        this.socketServer = null;
    }

    /**
     * 
     * @param {import('http').Server} server 
     */
    addListeners (server) {
        console.log('[UploadHandler] Adding listeners.');
        this.socketServer = io(server);

        this.socketServer.on('connection', (socket) => {
            console.log('[UploadHandler] on new connection');
            let job = {
                show: '',
                season: '',
                banner: '',
                directory: '',
                files: []
            };

            socket.on('init', params => {
                const { show, season } = params;
                console.log(`[UploadHandler] Ready to write ${show}, ${season}`);
                job.show = show;
                job.season = season;
                job.directory = path.resolve(basePath, job.show);
                socket.emit('ready');
            });

            socketStreamer(socket)
                .on('thumb', async (stream, data) => {
                    const filename = path.basename(THUMB_PATH);
                    const finalPath = path.resolve(job.directory, filename);
                    await this.createDirIfNotExists(job.directory);
                    stream.pipe(fs.createWriteStream(finalPath));
                });

            socket.on('disconnect', () => {

            });

            // ss(socket).on('profile-image', function (stream, data) {
            //     var filename = path.basename(data.name);
            //     stream.pipe(fs.createWriteStream(filename));
            // });
        });
    }

    createDirIfNotExists (directory) {
        return new Promise((resolve, reject) => {
            fs.stat(directory, async (err) => {
                if (err && (err.errno === -2 || err.code === 'ENOENT')) {
                    await  fsp.mkdir(directory);
                    resolve();
                } else if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

function checkDirectory(directory, callback) {
    fs.stat(directory, function (err, stats) {
        //Check if error defined and the error code is "not exists"
        if (err && err.errno === 34) {
            //Create the directory, call the callback.
            fs.mkdir(directory, callback);
        } else {
            //just in case there was a different error:
            callback(err)
        }
    });
}

module.exports = new UploadHandler();
