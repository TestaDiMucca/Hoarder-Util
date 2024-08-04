import { checkSupportedExt, searchForTextInImage } from '@common/fileops';
import { ModuleHandler } from '@util/types';

const ocrHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const stringMatch = opts.clientOptions?.value;

        if (!stringMatch) return;

        /* Support CSV */
        const matches = String(stringMatch)
            .split(',')
            .map((s) => s.trim());

        const hasMatches = await searchForTextInImage(fileWithMeta.filePath, matches);

        if (!hasMatches) fileWithMeta.remove = true;
    },
    filter: (fileName) => checkSupportedExt(fileName, ['img'], true),
};

export default ocrHandler;
