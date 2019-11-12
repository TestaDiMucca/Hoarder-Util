const io = require('socket.io');
const socketStreamer = require('socket.io-stream');

class UploadHandler {
    constructor () {
        this.socketServer = null;
    }

    /**
     * 
     * @param {import('http').Server} server 
     */
    addListeners (server) {
        this.socketServer = io(server);

        this.socketServer.on('connection', (socket) => {
            // ss(socket).on('profile-image', function (stream, data) {
            //     var filename = path.basename(data.name);
            //     stream.pipe(fs.createWriteStream(filename));
            // });
        });
    }
}

module.exports = new UploadHandler();
