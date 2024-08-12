import { parseNumber } from '@common/common';
import {
    checkSupportedExt,
    ffMeta,
    getFileSize,
    getTempName,
    replaceFile,
    splitFileNameFromPath,
} from '@common/fileops';
import { ProcessingError } from '../../utils/errors';
import output from '../../utils/output';
import { addNumericalStat } from '../../utils/stats';
import { ModuleHandler } from '../../utils/types';

const movCompressHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const parsedQuality = parseNumber(String(opts.clientOptions?.value ?? 'null'));

        if (!parsedQuality || parsedQuality <= 0 || parsedQuality >= 100)
            throw new ProcessingError(`${parsedQuality} is not a valid quality number`);

        const { filePath } = fileWithMeta;

        const sizeBefore = await getFileSize(filePath, 'number');

        const { fileName } = splitFileNameFromPath(filePath);

        await ffMeta.compressVideo(filePath, parsedQuality, (progress) => opts.onProgress?.(`${fileName}`, progress));
        await replaceFile(filePath, getTempName(filePath));

        const sizeAfter = await getFileSize(filePath, 'number');
        const reduced = sizeBefore - sizeAfter;

        void addNumericalStat('bytesShaved', reduced);

        if (reduced < 0) output.out(`${fileName} bloated by ${reduced}b`);
        else output.log(`${fileName} reduced by ${reduced}b`);
    },
    filter: (fileString) => checkSupportedExt(fileString, ['mov'], true),
};

export default movCompressHandler;
