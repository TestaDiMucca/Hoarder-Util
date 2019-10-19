const fs = require('fs');
const { promisify } = require('util');

const appendFile = promisify(fs.appendFile);
const logPath = process.env.LOG_PATH || '../log.txt';

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
     * @param {number} level 
     * @param {string} log 
     */
    async insertLog (level, log) {
        await appendFile(logPath, `[${new Date().toISOString()}][LOG: ${level}], ${log}`);
    }
};

Logger.Levels = {
    LOG: 3,
    ERROR: 5
};

module.exports = new Logger();
