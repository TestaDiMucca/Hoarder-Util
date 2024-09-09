import { FilterTestRequest, ProcessingModuleType } from '@shared/common.types';
import filterHandler from './modules/filter.handler';
import { fileListToFileOptions, withFileListHandling } from './handler.helpers';
import { splitFileNameFromPath } from '@common/fileops';
import ocrHandler from './modules/ocr.handler';

export const filterTest = async (filterTestRequest: FilterTestRequest) => {
    const { filePaths, invert, moduleType, type } = filterTestRequest;

    const filter = type === ProcessingModuleType.ruleFilter ? null : filterTestRequest.filter;

    // todo: handling rules vs string based
    if (!filter) return [];

    const moduleHandler = moduleType === ProcessingModuleType.ocr ? ocrHandler : filterHandler;

    const fileOptions = fileListToFileOptions(filePaths);

    await withFileListHandling({
        fileOptions,
        clientOptions: { value: filter!, inverse: invert },
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
