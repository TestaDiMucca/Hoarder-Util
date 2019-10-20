const youtubeDLCallback = require('youtube-dl');
const { promisify } = require('util');

const {
    DEFAULT_TITLING,
    SUPPORTED_OPTIONS,
    PLATFORMS
} = require('../constants');

const youtubeDL = {
    getInfo: promisify(youtubeDLCallback.getInfo),
    getSubs: promisify(youtubeDLCallback.getSubs)
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

const getPlatform = (link) => {
    const p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (link.match(p)) {
        return PLATFORMS.YOUTUBE;
    }
    return null;
}

/**
 * 
 * @param {string} link 
 * @param {{ formatID: string }} options 
 */
const downloadYoutube = (link, options) => {
    return new Promise((resolve, reject) => {

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
    const { formats, fulltitle, uploader, upload_date } = info;

    const hyphenDate = `${upload_date.substr(0, 4)}-${upload_date.substr(4, 2)}-${upload_date.substr(6, 2)}`;

    let filename = getTitleString(Object.assign({}, info, { upload_date: hyphenDate }), options);

    const metadata = {
        artist: uploader,
        title: fulltitle
    };

    const formatsFiltered = formats.filter(format => format.ext === 'mp4' || format.ext === 'm4a');

    return {
        filename,
        formatsFiltered,
        info,
        metadata
    }
};

const getTitleString = (info, options) => {
    let title = options;
    Object.keys(SUPPORTED_OPTIONS).forEach(key => title = title.replace(key, info[SUPPORTED_OPTIONS[key]]));
    return title;
};

module.exports = {
    handleDownload,
    handleGetInfo
};
