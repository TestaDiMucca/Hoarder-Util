import { unlink } from 'fs/promises';
import { parseNumber } from '@common/common';
import {
    checkSupportedExt,
    ffMeta,
    getFileSize,
    getTempName,
    replaceFile,
    splitFileNameFromPath,
} from '@common/fileops';
import { ProcessingError } from '@util/errors';
import output from '@util/output';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport } from '../handler.helpers';
import { addStat } from '@util/ipc';

const movCompressHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const parsedQuality = parseNumber(String(opts.clientOptions?.value ?? 'null'));
        if (!parsedQuality || parsedQuality <= 0 || parsedQuality >= 100)
            throw new ProcessingError(`${parsedQuality} is not a valid quality number`);

        const { filePath } = fileWithMeta;

        const sizeBefore = await getFileSize(filePath, 'number');

        const { fileName } = splitFileNameFromPath(filePath);

        await ffMeta.compressVideo(filePath, parsedQuality, (progress) => opts.onProgress?.(`${fileName}`, progress));

        const tempFilePath = getTempName(filePath);

        const sizeAfter = await getFileSize(tempFilePath, 'number');
        const reduced = sizeBefore - sizeAfter;

        if (reduced < 0) {
            // File got larger, so we don't replace it
            output.out(`${fileName} bloated by ${reduced}b`);
            addEventLogForReport(opts, fileName, 'failed compress', `${reduced}b`);
            await unlink(tempFilePath);
            return;
        }

        await replaceFile(filePath, tempFilePath);

        if (opts.context?.pipelineId) {
            addStat({
                pipelineUuid: opts.context.pipelineId,
                stats: [
                    {
                        stat: 'bytes_compressed',
                        amount: reduced,
                    },
                ],
            });
        }

        output.log(`${fileName} reduced by ${reduced}b`);

        addEventLogForReport(opts, fileName, 'compressed', `${reduced}b`);
    },
    filter: (fileString) => checkSupportedExt(fileString, ['mov'], true),
};

export default movCompressHandler;
