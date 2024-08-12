import { checkSupportedExt, searchForTextInImage } from '@common/fileops';
import { ModuleHandler } from '../../utils/types';

const ocrHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const stringMatch = opts.clientOptions?.value;

        if (!stringMatch) return;

        /* Support CSV */
        const matches = String(stringMatch)
            .split(',')
            .map((s) => s.trim());

        const hasMatches = await searchForTextInImage(fileWithMeta.filePath, matches);

        const inverse = opts.clientOptions?.inverse;
        if ((!hasMatches && !inverse) || (hasMatches && inverse)) fileWithMeta.remove = true;
    },
    filter: (fileName) => checkSupportedExt(fileName, ['img'], true),
};

export default ocrHandler;
