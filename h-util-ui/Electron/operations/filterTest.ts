import { FilterTestRequest, ProcessingModuleType } from '@shared/common.types';
import { fileListToFileOptions, withFileListHandling } from './handler.helpers';
import { splitFileNameFromPath } from '@common/fileops';
import { MODULE_MAP } from './modules/moduleMap';

export const filterTest = async (filterTestRequest: FilterTestRequest) => {
    const { filePaths, invert, type } = filterTestRequest;

    const moduleHandler = MODULE_MAP[type!];

    if (!moduleHandler) throw new Error(`No handler found for ${type}`);

    const fileOptions = fileListToFileOptions(filePaths);
    const usesRules = type === ProcessingModuleType.ruleFilter;

    // todo: fix - "remove" should be tacked on fileWithMeta
    await withFileListHandling({
        fileOptions,
        clientOptions: usesRules
            ? { inverse: invert, rules: filterTestRequest.rules, value: '' }
            : { value: filterTestRequest.filter, inverse: invert },
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
