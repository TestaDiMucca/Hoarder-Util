import io from 'socket.io-client';
import socketStream from 'socket.io-stream/socket.io-stream';
import { SERVER } from '../helpers/constants';

socketStream.forceBase64 = true;
class UploadService {
    constructor () {
        this.season = null;
        this.show = null;
        this.bannerFile = null;
        this.mediaFiles = null;

        this.socket = null;
        this.callback = null;
    }

    clearInfo () {
        this.season = null;
        this.show = null;
        this.bannerFile = null;
        this.mediaFiles = null;

        this.socket = null;
        this.callback = null;
    }

    newJob (season, show, bannerFile, mediaFiles) {
        this.season = season;
        this.show = show;
        this.bannerFile = bannerFile[0];
        this.mediaFiles = mediaFiles;
        return this;
    }

    upload () {
        return new Promise((resolve, reject) => {
            let socket = io.connect(SERVER);
            this.socket = socket;
            socket.on('connect', () => {
                socket.emit('init', {
                    show: this.show,
                    season: this.season
                });
            });

            socket.on('ready', async () => {
                console.log('server ready');
                await this.uploadThumbnail(socket);
            });
        });
    }   

    uploadThumbnail (socket) {
        return new Promise(resolve => {
            if (!this.bannerFile) resolve();

            let stream = socketStream.createStream();
            let size = 0;
            socketStream(socket).emit('thumb', stream, { size: this.bannerFile.size });
            
            let blobStream = socketStream.createBlobReadStream(this.bannerFile);

            blobStream.on('data', chunk => {
                size += chunk.length;
                if (this.callback) this.callback('Uploading thumbnail banner image.', Math.floor(size / this.bannerFile.size * 100));
            }).on('end', () => {
                resolve();
            });
            blobStream.pipe(stream);
        });
    }

    cancel () {
        if (this.socket) this.socket.disconnect();
        this.clearInfo();
    }

    /**
     * @param {function(string, number)} callback Return curr progress and %
     */
    onProgress (callback) {
        if (callback instanceof Function) this.callback = callback;
        return this;
    }
};

export default new UploadService();
