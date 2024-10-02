import { parseNumber } from '@common/common';
import { checkSupportedExt, compressToLevel, getFileSize, splitFileNameFromPath } from '@common/fileops';
import { ProcessingError } from '@util/errors';
import output from '@util/output';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport } from '../handler.helpers';
import { addPipelineRunStat } from '../../data/stats.db';

const jpgCompressHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const parsedQuality = parseNumber(String(opts.clientOptions?.value ?? 'null'));

        if (!parsedQuality || parsedQuality <= 0 || parsedQuality >= 100)
            throw new ProcessingError(`${parsedQuality} is not a valid quality number`);

        const { filePath } = fileWithMeta;

        const sizeBefore = await getFileSize(filePath, 'number');

        const { fileName } = splitFileNameFromPath(filePath);
        await compressToLevel(filePath, parsedQuality, (label: string, progress: number) =>
            opts.onProgress?.(`${fileName}:${label}`, progress),
        );

        const sizeAfter = await getFileSize(filePath, 'number');
        const reduced = sizeBefore - sizeAfter;

        if (opts.context?.pipelineId) void addPipelineRunStat(opts.context.pipelineId, 'bytes_compressed', reduced);

        output.log(`${fileName} reduced by ${reduced}b`);

        addEventLogForReport(opts, fileName, 'compressed', `${reduced}b`);
    },
    filter: async (fileString) => checkSupportedExt(fileString, ['img'], true),
};

export default jpgCompressHandler;
