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
  directoryTree = 'dir-tree',
}

/** A custom theme was applied */
export type ColorsWithTheme<T extends string> = typeof colors & {
  [key in T]: (i: string) => void;
};

/*
 * === Options Payloads ===
 */

type UniversalFlags = {
  verbose?: boolean;
  commandArgs?: string[];
  commit?: boolean;
};

export type FsOpFlags = {
  operation: Operations.directoryTree;
  path?: string;
} & UniversalFlags;

export type FileOpFlags = {
  operation: Operations.nameToTag | Operations.dateTag;
  path?: string;
  excludes?: string;
  format?: string;
} & UniversalFlags;

export type NiHaoTestFlags = {
  operation: Operations.nihao;
  quick?: boolean;
} & UniversalFlags;

export type BasicFlags = {
  operation: Operations.umu;
} & UniversalFlags;

export type TerminalArgs =
  | UniversalFlags
  | FileOpFlags
  | NiHaoTestFlags
  | FsOpFlags;

export type OperationHandler = (opts?: TerminalArgs) => void | Promise<void>;
