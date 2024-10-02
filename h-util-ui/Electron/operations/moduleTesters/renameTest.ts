import { ProcessingModule, ProcessingModuleType, RenameTestRequest } from '@shared/common.types';
import { fileListToFileOptions } from '../handler.helpers';
import { splitFileNameFromPath } from '@common/fileops';
import { promises } from '@common/common';
import { runModuleForFile } from '../handler';
import { FileWithMeta } from '@util/types';

export const renameTest = async (renameTestRequest: RenameTestRequest) => {
    const { filePaths, templateString } = renameTestRequest;

    const fileOptions = fileListToFileOptions(filePaths);

    const mockModule: ProcessingModule = {
        id: '0',
        type: ProcessingModuleType.dynamicRename,
        options: { value: templateString },
    };

    await promises.each(fileOptions.filesWithMeta, async (fileWithMeta: FileWithMeta) =>
        runModuleForFile({
            processingModule: mockModule,
            fileWithMeta,
            commonContext: {
                testMode: true,
            },
        }),
    );

    return fileOptions.filesWithMeta.map((fileWithMeta) => {
        const { fileName: ogName } = splitFileNameFromPath(fileWithMeta.filePath);
        if (!fileWithMeta.newFilePath) return `${ogName} » ${ogName}`;
        const { fileName: newName } = splitFileNameFromPath(fileWithMeta.newFilePath);

        return `${ogName} - ${newName}`;
    });
};
