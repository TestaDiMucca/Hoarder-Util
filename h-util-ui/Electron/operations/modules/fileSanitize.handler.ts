import { rename as fsRename } from 'fs/promises';
import { splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport, sanitizeStringForFilename } from '../handler.helpers';
import output from '@util/output';

const fileSanitize: ModuleHandler = {
    handler: async ({ filePath }, opts) => {
        const { fileName, rootPath: _rootPath } = splitFileNameFromPath(filePath);

        const replacementCharacter = opts.clientOptions?.value ?? '_';
        const newName = sanitizeStringForFilename(fileName, String(replacementCharacter));

        const newPath = filePath.replace(fileName!, newName);

        output.log(`rename ${fileName} to ${newName}`);

        await fsRename(filePath, newPath);
        filePath = newPath;

        addEventLogForReport(opts, fileName, 'renamed', newName);
    },
    filter: () => true,
};

export default fileSanitize;
