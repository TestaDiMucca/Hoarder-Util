const io = require('socket.io');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const diskusage = require('diskusage');

const { CODEC_CHOICES, THUMB_PATH } = require('../constants');
const Tools = require('../Objects/Tools');

const fsp = {
    mkdir: promisify(fs.mkdir)
};
const basePath = process.env.SCAN_PATH || './';
const UPLOAD_TYPES = {
    THUMB: 'thumb',
    MEDIA: 'media'
}

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

                socket.on('convert', async params => {
                    try {
                        const { name, target } = params;
                        const filepath = this.getPath(job.directory, job.season, UPLOAD_TYPES.MEDIA, name);
                        const convertedPath = Tools.replaceExtension(filepath, target);

                        const currExt = Tools.getExtension(filepath);

                        if (currExt.toLowerCase() === target.toLowerCase()) return socket.emit('convertDone', null);
                        console.log(`[UploadHandler] convert call for ${name} to ${target}`);
                        if (currExt === 'mkv') return this.doMKV(filepath, convertedPath, socket, target);

                        let p = 0;

                        ffmpeg(filepath)
                            .output(convertedPath)
                            .audioCodec(CODEC_CHOICES[target].audio)
                            .videoCodec(CODEC_CHOICES[target].video)
                            // .outputOptions(currExt === 'mkv' ? `-vf subtitles=${filepath}` : '')
                            .on('end', () => {
                                socket.emit('convertDone', null);
                                this.unlinkIfNeeded(filepath);
                            })
                            .on('progress', progress => {
                                p++;
                                const { currentFps, timemark } = progress;
                                if (p % 10 === 0) console.log(`[UploadHandler] Processed ${timemark}, at ${currentFps} fps`);
                                socket.emit('converting', { timemark });
                            })
                            .run();
                    } catch (e) {
                        socket.emit('convertDone', e.message);
                    }
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

    doMKV (filepath, convertedPath, socket, target) {
        ffmpeg(filepath)
            .output(convertedPath)
            .audioCodec(CODEC_CHOICES[target].audio)
            .videoCodec(CODEC_CHOICES[target].video)
            // .outputOptions(currExt === 'mkv' ? `-vf subtitles=${filepath}` : '')
            .on('end', () => {
                socket.emit('convertDone', null);
                this.unlinkIfNeeded(filepath);
            })
            .on('progress', progress => {
                const { timemark } = progress;
                socket.emit('converting', { timemark });
            })
            .run();
    }

    getPath (directory, season, type, filename) {
        switch (type) {
            case UPLOAD_TYPES.THUMB:
                return path.resolve(directory, THUMB_PATH.substr(1));
            case UPLOAD_TYPES.MEDIA:
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
