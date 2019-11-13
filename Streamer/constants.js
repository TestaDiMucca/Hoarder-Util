/** Port for the Express process to listen to */
const PORT = 5003;
const SQLITE_DB = `${__dirname}/data.db`;
const THUMB_PATH = '/thumb.jpg';

const CODEC_CHOICES = {
    webm: {
        audio: 'vorbis',
        video: 'libvpx'
    },
    mp4: {
        audio: 'libfaac',
        video: 'libx264'
    }
};

module.exports = {
    CODEC_CHOICES,
    PORT,
    SQLITE_DB,
    THUMB_PATH
};