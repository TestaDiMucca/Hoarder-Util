import { rename as fsRename } from 'fs/promises';
import { checkSupportedExt, getDateStringForFile, splitFileNameFromPath } from '@common/fileops';

import { ModuleHandler } from '@util/types';
import { ProcessingError } from '@util/errors';
import output from '@util/output';
import { addEventLogForReport } from '../handler.helpers';

const datePrefixHandler: ModuleHandler = {
    handler: async ({ filePath }, opts) => {
        const isImg = checkSupportedExt(filePath, ['img'], true);

        const { dateStr, exifUsed: _exifUsed } = await getDateStringForFile(filePath, isImg);

        if (!dateStr) throw new ProcessingError(`No date for ${filePath}`);

        const { fileName, rootPath: _rootPath } = splitFileNameFromPath(filePath);

        const newName = `${dateStr}${fileName}`;
        const newPath = filePath.replace(fileName!, newName);

        output.log(`rename ${fileName} to ${newName}`);

        await fsRename(filePath, newPath);

        addEventLogForReport(opts, fileName, 'renamed', newName);
    },
    filter: (filePath) => checkSupportedExt(filePath, ['img', 'mov'], true),
};

export default datePrefixHandler;
