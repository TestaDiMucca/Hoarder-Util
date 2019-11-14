/** Port for the Express process to listen to */
const PORT = 5001;

/** Default way to title downloaded files */
const DEFAULT_TITLING = '{fulltitle} - {upload_date}';

/** Map how the options string is represented to the key name in YT Info */
const SUPPORTED_OPTIONS = {
    '{fulltitle}': 'fulltitle',
    '{upload_date}': 'upload_date',
    '{uploader}': 'uploader'
};

/** Supported platforms for detecting */
const PLATFORMS = {
    YOUTUBE: 'youtube'
};

/** Format for date renamer, in moment.js string */
const DEFAULT_FORMAT = 'YYYY[-]MM[-]DD[-]HH[-]mm';

/** Main file that logs will go to */
const MAIN_LOGFILE = 'log.txt';

const SLIDE_PORT = 4001;
const WIKI_PORT = 5002;
const AGUA_PORT = 5003;

const DIRECORY_LIST = [
    {
        name: 'Barebones Utility Operator',
        description: '...',
        icon: 'local_drink',
        url: `:${PORT}/barebones`
    },
    {
        name: 'Slideshow',
        description: '...',
        icon: 'local_bar',
        url: `:${SLIDE_PORT}/`
    },
    {
        name: 'Slideshow Trip Editor',
        description: '...',
        icon: 'local_cafe',
        url: `:${SLIDE_PORT}/tripEditor`
    },
    {
        name: 'Tiddly Valkawiki',
        description: '...',
        icon: 'local_florist',
        url: `${WIKI_PORT}/`
    },
    {
        name: 'Agua+',
        description: '...',
        icon: 'local_activity',
        url: `${AGUA_PORT}/`
    }
];

module.exports = {
    DEFAULT_TITLING,
    DEFAULT_FORMAT,
    MAIN_LOGFILE,
    SUPPORTED_OPTIONS,
    PLATFORMS,
    PORT,
    DIRECORY_LIST
};