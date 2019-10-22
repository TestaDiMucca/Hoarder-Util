const fs = require('fs');
const { promisify } = require('util');

const { MAIN_LOGFILE } = require('../constants');

const appendFile = promisify(fs.appendFile);
const logPath = process.env.LOG_PATH || '../';

/**
 * Tiny logger.
 * Should prob use something like winston, but idc enough about this
 */
class Logger {
    log (...args) {
        this.insertLog(Logger.Levels.LOG, this.stringifyArgs(args));
    }

    error (...args) {
        this.insertLog(Logger.Levels.ERROR, this.stringifyArgs(args));
    }

    /**
     * @param {Array} args 
     */
    stringifyArgs (args) {
        try {
            return args.map(v => typeof v === 'string' ? v : JSON.stringify(v));
        } catch (e) {
            this.error('Error stringifying log', e.message);
        }
    }

    /**
     * Just make a record of something in list format
     * @param {string} message
     * @param {string} file Please also include extension
     */
    async record (message, file) {
        await appendFile(logPath + file, `> ${message}\n`);
    }

    /**
     * @param {number} level 
     * @param {string} log 
     */
    async insertLog (level, log) {
        await appendFile(logPath + MAIN_LOGFILE, `[T:${new Date().toISOString()}][LOG: ${level}], ${log}\n`);
    }
};

Logger.Levels = {
    LOG: 3,
    ERROR: 5
};

module.exports = new Logger();
