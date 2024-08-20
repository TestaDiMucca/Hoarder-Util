import { FilterTestRequest, ProcessingModuleType } from '@shared/common.types';
import filterHandler from './modules/filter.handler';
import { fileListToFileOptions, withFileListHandling } from './handler.helpers';
import { splitFileNameFromPath } from '@common/fileops';
import ocrHandler from './modules/ocr.handler';

export const filterTest = async (filterTestRequest: FilterTestRequest) => {
    const { filter, filePaths, invert, moduleType } = filterTestRequest;

    const moduleHandler = moduleType === ProcessingModuleType.ocr ? ocrHandler : filterHandler;

    const fileOptions = fileListToFileOptions(filePaths);

    await withFileListHandling({
        fileOptions,
        clientOptions: { value: filter, inverse: invert },
        moduleHandler,
    });

    const remainingFiles = new Set(...[fileOptions.filesWithMeta.map((f) => f.filePath)]);

    return filePaths.reduce<string[]>((a, p) => {
        if (!remainingFiles.has(p)) {
            const { fileName } = splitFileNameFromPath(p);

            a.push(fileName);
        }
        return a;
    }, []);
};
