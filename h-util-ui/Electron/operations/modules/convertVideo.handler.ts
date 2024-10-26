import { unlink } from 'fs/promises';
import { checkSupportedExt, ffMeta, getExt, replaceExtension, splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport } from '../handler.helpers';

const convertVideoHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const { filePath } = fileWithMeta;

        const { fileName } = splitFileNameFromPath(filePath);

        const outputFilePath = replaceExtension(filePath, 'mp4');

        await ffMeta.callFfmpeg({
            filePath,
            outputFilePath,
            onProgress: (progress) => opts.onProgress?.(`${fileName}`, progress),
        });

        await unlink(filePath);
        fileWithMeta.filePath = outputFilePath;

        addEventLogForReport(opts, fileName, 'converted', outputFilePath);
    },
    filter: (fileString) => checkSupportedExt(fileString, ['mov'], true) && getExt(fileString) !== 'mp4',
};

export default convertVideoHandler;
