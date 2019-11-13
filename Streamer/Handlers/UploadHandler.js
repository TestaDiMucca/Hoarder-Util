const io = require('socket.io');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const socketStreamer = require('socket.io-stream');
const diskusage = require('diskusage');

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
                files: [],
                options: null /* Support ffmpeg to webm in future */
            };

            socket.on('init', async params => {
                const { show, season, options } = params;
                console.log(`[UploadHandler] Ready to write ${show}, ${season}`);
                job.show = show;
                job.season = season;
                job.directory = path.resolve(basePath, job.show);
                job.options = options;
                await this.prepareDirsForJob(job.directory, job.season);
                socket.emit('ready');

                socket.on('prepare', async params => {
                    const { name, type } = params;
                    let filepath = this.getPath(job.directory, job.season, type, name);
                    await this.unlinkIfNeeded(filepath);
                    socket.emit('prepared');
                });

                socket.on('chunk', async params => {
                    const { chunk, name, packetNo, type } = params;
                    let filepath = this.getPath(job.directory, job.season, type, name);
                    
                    if (packetNo === 0) console.log('[UploadHandler] Successfully received first packet');
                    const data = new Buffer(new Uint8Array(chunk));

                    fs.appendFile(filepath, data, () => {
                        socket.emit('doneWriting', packetNo);
                    });
                });

                socket.on('cancel', () => {
                    /* Cancel jobs and remove */
                });
            });

            socket.on('disconnect', () => {
                socket.removeAllListeners();
            });
        });
    }

    getPath (directory, season, type, filename) {
        switch (type) {
            case 'thumb':
                return path.resolve(directory, THUMB_PATH.substr(1));
            case 'media':
                const subDir = season || '.';
                return path.resolve(directory, subDir, filename);
        }
        return '.';
    }

    async prepareDirsForJob (directory, season) {
        const subDir = season || '.';
        await this.createDirIfNotExists(directory);
        await this.createDirIfNotExists(path.resolve(directory, subDir));
    }

    unlinkIfNeeded (path) {
        console.log('[UploadHandler] unlinking', path);
        return new Promise(resolve => {
            fs.unlink(path, resolve);
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

    async checkDiskUsage () {
        try {
            const result = await diskusage.check(basePath);
            return result;
        } catch (e) {
            return {
                free: 0,
                total: 0
            };
        }
    }
}

module.exports = new UploadHandler();
