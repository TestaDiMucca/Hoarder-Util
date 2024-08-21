import winston from 'winston';
import path from 'path';
import { app } from 'electron';

const options = {
    file: {
        level: 'info',
        filename: path.join(app.getPath('userData'), 'logs/h-util-out.log'),
        handleExceptions: true,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    },
};

const logger = winston.createLogger({
    transports: [new winston.transports.File(options.file), new winston.transports.Console(options.console)],
    exitOnError: false, // do not exit on handled exceptions
});

export default logger;
