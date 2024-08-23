import { RenameTestRequest } from '@shared/common.types';
import { fileListToFileOptions, withFileListHandling } from './handler.helpers';
import { splitFileNameFromPath } from '@common/fileops';
import dynamicRenameHandler from './modules/dynamicRename.handler';

export const renameTest = async (renameTestRequest: RenameTestRequest) => {
    const { filePaths, templateString } = renameTestRequest;

    const moduleHandler = dynamicRenameHandler;

    const fileOptions = fileListToFileOptions(filePaths);

    await withFileListHandling({
        fileOptions,
        clientOptions: { value: templateString },
        moduleHandler,
        context: {
            testMode: true,
        },
    });

    return fileOptions.filesWithMeta.map((fileWithMeta) => {
        const { fileName: ogName } = splitFileNameFromPath(fileWithMeta.filePath);
        if (!fileWithMeta.newFilePath) return `${ogName} » ${ogName}`;
        const { fileName: newName } = splitFileNameFromPath(fileWithMeta.newFilePath);

        return `${ogName} - ${newName}`;
    });
};
