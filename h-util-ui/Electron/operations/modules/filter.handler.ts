import { checkFilenameExcluded } from '@common/common';
import { splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';

const filterHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const stringMatch = opts.clientOptions?.value;

        if (!stringMatch) return;

        const { fileName } = splitFileNameFromPath(fileWithMeta.filePath);

        const excluded = checkFilenameExcluded(fileName, String(stringMatch));

        if (excluded) fileWithMeta.remove = true;
    },
    filter: () => true,
    onDone: async (_opts, _store, fileOptions) => {
        fileOptions.filesWithMeta = fileOptions.filesWithMeta.filter((f) => !f.remove);
    },
};

export default filterHandler;
