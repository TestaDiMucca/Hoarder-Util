/** Port for the Express process to listen to */
const PORT = 5003;
const SQLITE_DB = `${__dirname}/data.db`;
const THUMB_PATH = '/thumb.jpg';

module.exports = {
    PORT,
    SQLITE_DB,
    THUMB_PATH
};