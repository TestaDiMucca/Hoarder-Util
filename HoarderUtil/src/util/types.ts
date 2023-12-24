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
  pathAlias = 'paths',
  opAlias = 'op-alias',
}

/*
 * === Options Payloads ===
 */

type UniversalFlags = {
  operation: string;
  verbose?: boolean;
  commandArgs?: string[];
  commit?: boolean;
  saveAlias?: string;
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
  operation: Operations.umu | Operations.pathAlias;
} & UniversalFlags;

export type TerminalArgs =
  | UniversalFlags
  | FileOpFlags
  | NiHaoTestFlags
  | FsOpFlags
  | BasicFlags;

export type OperationHandler = (opts?: TerminalArgs) => void | Promise<void>;
