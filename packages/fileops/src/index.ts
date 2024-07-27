import { printf, chunkArray, promises, randomFromArray } from '@common/common';

/** Test method to confirm import and usage of common library */
export const printfExtended = (message: string) => printf(message);

/** General utility methods carried from common */
export const utils = {
    promises,
    randomFromArray,
    chunkArray,
};
