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

export class ProcessingError extends BaseError {
    constructor(message = 'Error processing file') {
        super(message);
    }
}
