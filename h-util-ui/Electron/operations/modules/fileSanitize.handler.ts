import { rename as fsRename, access as fsAccess } from 'fs/promises';
import { getExt, splitFileNameFromPath } from '@common/fileops';
import { ModuleHandler } from '@util/types';
import { addEventLogForReport, sanitizeStringForFilename } from '../handler.helpers';
import output from '@util/output';

/** If replacement characters make up more than this threshold, check name duplication */
const REPLACEMENT_THRESHOLD = 0.4;

const fileSanitize: ModuleHandler = {
    handler: async ({ filePath }, opts) => {
        const { fileName, rootPath: _rootPath } = splitFileNameFromPath(filePath);

        const replacementCharacter = opts.clientOptions?.value ?? '_';
        let newName = sanitizeStringForFilename(fileName, String(replacementCharacter));

        let newPath = filePath.replace(fileName!, newName);
        let counter = 1;

        const replacementCharCount = newName.split('').filter((char) => char === replacementCharacter).length;
        const isOverThresholdReplacementChar = replacementCharCount / newName.length > REPLACEMENT_THRESHOLD;

        // Check if a file with the newPath already exists and modify the name if necessary
        while (
            isOverThresholdReplacementChar &&
            (await fsAccess(newPath)
                .then(() => true)
                .catch(() => false))
        ) {
            const fileExtension = newName.includes('.') ? getExt(fileName) : '';
            const baseName = newName.replace(fileExtension, '');
            newName = `${baseName}_${counter}.${fileExtension}`;
            newPath = filePath.replace(fileName!, newName);
            counter++;
        }

        output.log(`rename ${fileName} to ${newName}`);

        await fsRename(filePath, newPath);
        filePath = newPath;

        addEventLogForReport(opts, fileName, 'renamed', newName);
    },
    filter: () => true,
};

export default fileSanitize;
