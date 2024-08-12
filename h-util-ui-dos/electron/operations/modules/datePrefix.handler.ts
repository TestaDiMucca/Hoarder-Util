import { rename as fsRename } from 'fs/promises';
import { checkSupportedExt, getDateStringForFile, splitFileNameFromPath } from '@common/fileops';

import { ModuleHandler } from '../../utils/types';
import { ProcessingError } from '../../utils/errors';
import output from '../../utils/output';

const datePrefixHandler: ModuleHandler = {
    handler: async ({ filePath }, _opts) => {
        const isImg = checkSupportedExt(filePath, ['img'], true);

        const { dateStr, exifUsed: _exifUsed } = await getDateStringForFile(filePath, isImg);

        if (!dateStr) throw new ProcessingError(`No date for ${filePath}`);

        const { fileName, rootPath: _rootPath } = splitFileNameFromPath(filePath);

        const newName = `${dateStr}${fileName}`;
        const newPath = filePath.replace(fileName!, newName);

        output.log(`rename ${fileName} to ${newName}`);

        await fsRename(filePath, newPath);
    },
    filter: (filePath) => checkSupportedExt(filePath, ['img', 'mov'], true),
};

export default datePrefixHandler;
