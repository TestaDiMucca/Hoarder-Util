import { parseNumber } from '@common/common';
import { checkSupportedExt, ffMeta, getExt, getFileSize, splitFileNameFromPath } from '@common/fileops';
import { ProcessingError } from '@util/errors';
import output from '@util/output';
import { addNumericalStat } from '@util/stats';
import { ModuleHandler } from '@util/types';

const movCompressHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const parsedQuality = parseNumber(String(opts.clientOptions?.value ?? 'null'));

        if (!parsedQuality || parsedQuality <= 0 || parsedQuality >= 100)
            throw new ProcessingError(`${parsedQuality} is not a valid quality number`);

        const { filePath } = fileWithMeta;

        const sizeBefore = await getFileSize(filePath, 'number');

        const { fileName } = splitFileNameFromPath(filePath);

        await ffMeta.compressVideo(filePath, parsedQuality, (progress) => opts.onProgress?.(`${fileName}`, progress));

        const sizeAfter = await getFileSize(filePath, 'number');
        const reduced = sizeBefore - sizeAfter;

        void addNumericalStat('bytesShaved', reduced);

        if (reduced < 0) output.out(`${fileName} bloated by ${reduced}b`);
        else output.log(`${fileName} reduced by ${reduced}b`);
    },
    filter: (fileString) => checkSupportedExt(getExt(fileString), ['mov']),
};

export default movCompressHandler;
