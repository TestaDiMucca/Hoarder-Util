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
import { addPipelineRunStat } from '../../data/stats.db';

const movCompressHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const parsedQuality = parseNumber(String(opts.clientOptions?.value ?? 'null'));
        if (!parsedQuality || parsedQuality <= 0 || parsedQuality >= 100)
            throw new ProcessingError(`${parsedQuality} is not a valid quality number`);

        const { filePath } = fileWithMeta;

        const sizeBefore = await getFileSize(filePath, 'number');

        const { fileName } = splitFileNameFromPath(filePath);

        await ffMeta.compressVideo(filePath, parsedQuality, (progress: number) => opts.onProgress?.(`${fileName}`, progress));
        await replaceFile(filePath, getTempName(filePath));

        const sizeAfter = await getFileSize(filePath, 'number');
        const reduced = sizeBefore - sizeAfter;

        if (opts.context?.pipelineId) void addPipelineRunStat(opts.context.pipelineId, 'bytes_compressed', reduced);

        if (reduced < 0) output.out(`${fileName} bloated by ${reduced}b`);
        else output.log(`${fileName} reduced by ${reduced}b`);

        addEventLogForReport(opts, fileName, 'compressed', `${reduced}b`);
    },
    filter: (fileString) => checkSupportedExt(fileString, ['mov'], true),
};

export default movCompressHandler;
