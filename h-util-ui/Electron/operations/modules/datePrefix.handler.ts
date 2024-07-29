import { rename as fsRename } from 'fs/promises';
import { checkSupportedExt, getDateStringForFile, getExt, splitFileNameFromPath } from '@common/fileops';

import { ModuleHandler } from '../../util/types';
import { ProcessingError } from '../../util/errors';
import output from '../../util/output';

const datePrefixHandler: ModuleHandler = {
    handler: async (filePath, _opts) => {
        const ext = getExt(filePath);
        const isImg = checkSupportedExt(ext, ['img']);

        const { dateStr, exifUsed: _exifUsed } = await getDateStringForFile(filePath, isImg);

        if (!dateStr) throw new ProcessingError(`No date for ${filePath}`);

        const { fileName, rootPath: _rootPath } = splitFileNameFromPath(filePath);

        const newName = `${dateStr}${fileName}`;
        const newPath = filePath.replace(fileName!, newName);

        output.log(`rename ${fileName} to ${newName}`);

        await fsRename(filePath, newPath);
    },
    filter: (filePath) => checkSupportedExt(getExt(filePath), ['img', 'mov']),
};

export default datePrefixHandler;
