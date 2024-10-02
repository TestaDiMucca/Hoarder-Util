import { FilterTestRequest, ProcessingModule, ProcessingModuleType } from '@shared/common.types';
import { fileListToFileOptions } from '../handler.helpers';
import { splitFileNameFromPath } from '@common/fileops';
import { promises } from '@common/common';
import { runModuleForFile } from '../handler';
import { FileWithMeta } from '@util/types';

export const filterTest = async (filterTestRequest: FilterTestRequest) => {
    const { filePaths, invert, type } = filterTestRequest;

    const fileOptions = fileListToFileOptions(filePaths);
    const usesRules = type === ProcessingModuleType.ruleFilter;

    const mockModule: ProcessingModule = {
        id: '0',
        type,
        options: {
            inverse: invert,
            ...(usesRules ? { rules: filterTestRequest.rules, value: '' } : { value: filterTestRequest.filter }),
        },
    };

    await promises.each(fileOptions.filesWithMeta, async (fileWithMeta: FileWithMeta) =>
        runModuleForFile({
            processingModule: mockModule,
            commonContext: {},
            fileWithMeta,
        }),
    );

    const remainingFiles = new Set(
        ...[
            fileOptions.filesWithMeta.reduce<string[]>((a, f) => {
                if (!f.remove) a.push(f.filePath);
                return a;
            }, []),
        ],
    );

    return filePaths.reduce<string[]>((a, p) => {
        if (!remainingFiles.has(p)) {
            const { fileName } = splitFileNameFromPath(p);

            a.push(fileName);
        }
        return a;
    }, []);
};
