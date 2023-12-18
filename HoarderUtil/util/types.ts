/**
 * Supported operations
 */
export enum Operations {
  dateImg = 'date-img',
  nihao = 'nihao',
}

export type TerminalArgs = {
  operation: Operations;
  path?: string;
};
