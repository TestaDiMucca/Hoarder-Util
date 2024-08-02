import * as colors from 'colors/safe';
import { checkSupportedExt, compressToLevel, getExt } from '@common/fileops';

import { msgShortcuts } from '../util/helpers';
import output from '../util/output';
import { FileOpFlags } from '../util/types';
import { withFileListHandling } from './operations.helpers';

const jpgCompress = async (options: FileOpFlags) => {
    const [_quality] = options.commandArgs;
    const quality = Math.round(Number(_quality));

    if (isNaN(quality)) msgShortcuts.errorAndQuit('Quality must be a number');

    if (quality > 100 || quality < 1) msgShortcuts.errorAndQuit('Invalid quality. Use integer between 1-100.');

    await withFileListHandling({
        options,
        context: {},
        prepReducer: async (fileName, _, { add }) => {
            const validImg = checkSupportedExt(getExt(fileName), ['img']);

            output.log('Scanning', fileName);

            if (!validImg) return;

            add({
                fileName,
            });
        },
        commitItem: async ({ fileName }, { rootDir }, { onProgress }) => {
            const fullPath = `${rootDir}/${fileName}`;

            await compressToLevel(fullPath, quality, onProgress);

            output.log(`Completed ${colors.cyan(fileName)}`);
        },
    });
};

export default jpgCompress;
