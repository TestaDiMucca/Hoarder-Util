import * as colors from 'colors';

/**
 * Supported operations
 */
export enum Operations {
  /** Prepend date to an image based on modify or EXIF */
  dateTag = 'date-tag',
  /** Filename => media tags */
  nameToTag = 'name-to-tag',
  /** Test operation */
  nihao = 'nihao',
  /** Prints an umu */
  umu = 'umu',
  /** List operations and what they do */
  describe = 'describe',
}

export type TerminalArgs = {
  operation: Operations;
  path?: string;
  verbose?: boolean;
  /** For renaming/tagging options */
  format?: string;
  /** Specify dry run where no changes are made */
  commit?: boolean;
  excludes?: string;
};

export type OperationHandler = (opts?: TerminalArgs) => void | Promise<void>;

/** A custom theme was applied */
export type ColorsWithTheme<T extends string> = typeof colors & {
  [key in T]: (i: string) => void;
};
