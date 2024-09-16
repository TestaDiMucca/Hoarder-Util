import { checkAgainstRegex } from '@common/common';
import { splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport } from '../handler.helpers';

const filterHandler: ModuleHandler = {
    handler: async (fileWithMeta, opts) => {
        const stringMatch = opts.clientOptions?.value;

        if (!stringMatch) return;

        const { fileName } = splitFileNameFromPath(fileWithMeta.filePath);

        const excluded = checkAgainstRegex(fileName, String(stringMatch));

        const inverse = opts.clientOptions?.inverse;
        if ((excluded && !inverse) || (!excluded && inverse)) {
            fileWithMeta.remove = true;

            addEventLogForReport(opts, fileName, 'filtered');
        }
    },
};

export default filterHandler;
