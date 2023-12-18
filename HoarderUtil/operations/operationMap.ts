import { OperationHandler, Operations } from '../util/types';
import dateImg from './dateImg';
import describeHUtils from './describe';
import { umu } from './global';
import nameToTag from './nameToTag';
import nihao from './nihao';

type AnyFnc = (...args: any[]) => any;

type OpMap<T = AnyFnc> = {
  [key in Operations]?: T;
};

/**
 * Map option to handlers if available
 * If something requires more specific options and handling,
 *   then add it directly to index's main method
 */
export const operationMap: OpMap<OperationHandler> = {
  [Operations.nihao]: nihao,
  [Operations.umu]: umu,
  [Operations.dateTag]: dateImg,
  [Operations.nameToTag]: nameToTag,
  [Operations.describe]: describeHUtils,
};
