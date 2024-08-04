import * as colors from 'colors/safe';
import { checkSupportedExt, ffMeta, getExt } from '@common/fileops';

import { msgShortcuts } from '../util/helpers';
import output from '../util/output';
import { FileOpFlags } from '../util/types';
import { withFileListHandling } from './operations.helpers';

const movCompress = async (options: FileOpFlags) => {
    const [_quality] = options.commandArgs;
    const quality = Math.round(Number(_quality));

    if (isNaN(quality)) msgShortcuts.errorAndQuit('Quality must be a number');

    if (quality > 51 || quality < 1) msgShortcuts.errorAndQuit('Invalid quality. Use integer between 1-100.');

    await withFileListHandling({
        options,
        context: {},
        prepReducer: async (fileName, _, { add }) => {
            const validMov = checkSupportedExt(getExt(fileName), ['mov']);

            output.log('Scanning', fileName);

            if (!validMov) return;

            add({
                fileName,
            });
        },
        commitItem: async ({ fileName }, { rootDir }, { onProgress }) => {
            const fullPath = `${rootDir}/${fileName}`;

            await ffMeta.compressVideo(fullPath, quality, (p) => onProgress('compressing', p));

            output.log(`Completed ${colors.cyan(fileName)}`);
        },
    });
};

export default movCompress;
