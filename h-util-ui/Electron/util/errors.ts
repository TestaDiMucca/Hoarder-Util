export class BaseError extends Error {
    public message: string;
    public name: string;

    constructor(message: string) {
        super();

        this.message = message;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Processing error is something thrown by the handler on a specific file
 * Likely it is not config related, but a particular instance's problem
 */
export class ProcessingError extends BaseError {
    constructor(message = 'Error processing file') {
        super(message);
    }
}

/**
 * Configuration sent by client is not valid
 */
export class ConfigError extends BaseError {
    constructor(message = 'Error with config') {
        super(message);
    }
}
