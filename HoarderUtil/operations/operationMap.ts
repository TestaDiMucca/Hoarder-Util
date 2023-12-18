import { OperationHandler, Operations } from '../util/types';
import { umu } from './global';
import nihao from './nihao';

type AnyFnc = (...args: any[]) => any;

type OpMap = {
  [key in Operations]?: OperationHandler | AnyFnc;
};

/**
 * Map option to handlers if available
 * If something requires more specific options and handling,
 *   then add it directly to index's main method
 */
export const operationMap: OpMap = {
  [Operations.nihao]: nihao,
  [Operations.umu]: umu,
};
