const ytDL = require('youtube-dl');
// const ffmetadata = require('ffmetadata');
const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const Logger = require('./Logger');
const {
    DEFAULT_TITLING,
    SUPPORTED_OPTIONS,
    PLATFORMS
} = require('../constants');

/**
 * Promisified versions of some YT download stuff
 */
const youtubeDL = {
    getInfo: promisify(ytDL.getInfo),
    getSubs: promisify(ytDL.getSubs)
};

/**
 * Handle a request to get video info
 * @param {Request} req 
 * @param {Response} res 
 */
const handleGetInfo = async (req, res) => {
    try {
        const { link } = req.body;
        const platform = getPlatform(link);
        switch (platform) {
            case PLATFORMS.YOUTUBE: 
                const info = await getYoutubeInfo(link);
                return res.status(200).send(info);
            default:
                res.status(400).send('Link parsing could not find appropriate platform.')
        }
    } catch (e) {
        res.status(500).send(`Error with info: ${e.message}`);
    }
};

/**
 * Handle a request to download
 * @param {Request} req 
 * @param {Response} res 
 */
const handleDownload = async (req, res) => {
    try {
        const { link, options } = req.body;
        const platform = getPlatform(link);
        switch (platform) {
            case PLATFORMS.YOUTUBE:
                const info = await downloadYoutube(link, options);
                return res.status(200).send(info);
            default:
                res.status(400).send('Link parsing could not find appropriate platform.')
        }
    } catch (e) {
        res.status(500).send(`Error with dl: ${e.message}`);
    }
};

/**
 * Parse a link to see what pltform it is on
 * Only supporting YouTube for now
 * @param {string} link 
 */
const getPlatform = (link) => {
    const p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (link.match(p)) {
        return PLATFORMS.YOUTUBE;
    }
    return null;
}

/**
 * Download the video, actually
 * In future, can use socket to send progress to client
 * @param {string} link 
 * @param {{ formatID: string }} options 
 */
const downloadYoutube = (link, rawOpts) => {
    return new Promise((resolve, reject) => {
        const options = rawOpts ? typeof rawOpts === 'string' ? JSON.parse(rawOpts) : rawOpts : null;
        console.log('Request with options', options);
        try {
            let video = ytDL(link, options ? [`-f`, options.formatID] : null);
            let size = 0, pos = 0, filename = '', filePath = '';

            video.on('info', (info) => {
                size = info.size;
                filename = info._filename;
                Logger.log(`Started downloading ${filename}`);

                let file = path.resolve(process.env.SAVE_PATH || __dirname, info._filename);
                filePath = file;
                resolve({ file });
                video.pipe(fs.createWriteStream(file));
            });

            video.on('data', (chunk) => {
                pos += chunk.length;

                if (size) {
                    let percent = ((pos / size) * 100).toFixed(2);
                    console.log(`Downloading ${filename}: ${percent}%`);
                }
            });

            video.on('error', e => {
                reject(e);
            });

            video.on('end', async () => {
                Logger.log(`Completed downloading ${filename}`);
                const info = await getYoutubeInfo(link);
                await applyMetaData(filePath, {
                    title: info.metadata.title,
                    artist: info.metadata.artist,
                    year: info.metadata.year
                });
            });
        } catch (e) {
            reject(e);
        }
    });
};

/**
 * Get info on the video for naming purposes.. Possibly move these funcs out
 * @param {string} link 
 * @param {string} options
 */
const getYoutubeInfo = async (link, options = DEFAULT_TITLING) => {
    const info = await youtubeDL.getInfo(link);
    /* Upload date is returned in format: 20191018 */
    const { formats, uploader, upload_date } = info;

    const hyphenDate = `${upload_date.substr(0, 4)}-${upload_date.substr(4, 2)}-${upload_date.substr(6, 2)}`;

    let filename = getTitleString(Object.assign({}, info, { upload_date: hyphenDate }), options);

    const metadata = {
        artist: uploader,
        title: filename,
        year: hyphenDate.split('-')[0]
    };

    const formatsFiltered = formats.filter(format => format.ext === 'mp4' || format.ext === 'm4a');

    return {
        filename,
        formatsFiltered,
        info,
        metadata
    }
};

/**
 * Fill in the info to the title options string
 * @param {*} info 
 * @param {string} options 
 */
const getTitleString = (info, options) => {
    let title = options;
    Object.keys(SUPPORTED_OPTIONS).forEach(key => {
        title = title.replace(key, info[SUPPORTED_OPTIONS[key]])
    });
    return title;
};

/**
 * Use ffmpeg to apply metadata to the file
 * @param {string} filePath 
 * @param {{ title: string, artist: string, year: string }} options 
 */
const applyMetaData = (filePath, options) => {
    return new Promise(resolve => {
        options.comment = 'Downloaded by some hacky thing powered by youtube-dl.';

        let child = fork('./workers/metadata.js');
        child.send({ filePath, options });

        child.on('message', message => {
            if (message.error) {
                Logger.error('[applyMetaData] Error applying', e.message);
                console.error(e, message.message);
            }
            resolve();
        });

        // ffmetadata.write(filePath, options, (err) => {

        //     if (err) Logger.error(`Error on writing metadata: ${err.message}, ${filePath}`);
        //     resolve();
        // });
    });
};

module.exports = {
    handleDownload,
    handleGetInfo
};
