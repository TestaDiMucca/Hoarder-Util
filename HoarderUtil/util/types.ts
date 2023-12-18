/**
 * Supported operations
 */
export enum Operations {
  /** Prepend date to an image based on modify or EXIF */
  dateImg = 'date-img',
  /** Test operation */
  nihao = 'nihao',
  /** Prints an umu */
  umu = 'umu',
}

export type TerminalArgs = {
  operation: Operations;
  path?: string;
};

export type OperationHandler = (opts?: TerminalArgs) => void;
