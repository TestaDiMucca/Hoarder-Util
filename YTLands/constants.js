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

module.exports = {
    DEFAULT_TITLING,
    SUPPORTED_OPTIONS,
    PLATFORMS,
    PORT
};