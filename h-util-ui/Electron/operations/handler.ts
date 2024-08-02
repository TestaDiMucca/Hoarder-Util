import { promises } from '@common/common';
import output from '@util/output';
import { ProcessingError } from '@util/errors';
import { ProcessingModuleType, ProcessingRequest } from '@shared/common.types';
import { updateTaskProgress } from '@util/ipc';
import { FileOptions, FileWithMeta } from '@util/types';

import { withFileListHandling } from './handler.helpers';
import { MODULE_MAP } from './modules/moduleMap';
import { addPipelineRunToStats } from '@util/stats';

let taskId = 0;

export const handleRunPipeline = async (params: ProcessingRequest) => {
    const { filePaths, pipeline } = params;

    if (filePaths.length === 0 || pipeline.processingModules.length === 0) return;

    const pipelineId = pipeline.id!;

    const mainUpdate = (moduleName: string, progress: number, subName?: string, subProgress?: number) => {
        updateTaskProgress({
            id: taskId,
            pipelineId,
            name: moduleName,
            progress,
            subName,
            subProgress,
        });
    };

    /** Dup it in case we wish to modify */
    const filesWithMeta = filePaths.map<FileWithMeta>((filePath) => ({
        filePath,
    }));

    const fileOptions: FileOptions = {
        filesWithMeta,
    };

    let handled = 0;
    let currentModule: ProcessingModuleType = ProcessingModuleType.iterate;

    await promises.each(pipeline.processingModules, async (processingModule) => {
        const moduleHandler = MODULE_MAP[processingModule.type];

        currentModule = processingModule.type;
        const handledProgress = Math.ceil((handled / pipeline.processingModules.length) * 100);

        mainUpdate(currentModule, handledProgress);

        handled++;

        if (!moduleHandler) {
            output.log(`Module ${processingModule.type} not yet supported`);
            return;
        }

        output.log(`Processing module ${processingModule.type}`);

        try {
            /** One module's processing */
            await withFileListHandling({
                fileOptions,
                clientOptions: processingModule.options,
                moduleHandler,
                onProgress: (label, progress) => {
                    mainUpdate(currentModule, handledProgress, label, progress);
                },
            });
        } catch (e) {
            if (e instanceof ProcessingError) {
                // in future we may ignore
            } else {
                console.error('[runPipeline]', e);
                throw e;
            }
        }
    });

    if (handled > 0) mainUpdate(currentModule, 100);

    void addPipelineRunToStats(pipeline.name);

    taskId++;
};

export const handleClientMessage = (message: string) => {
    console.log(`[client-message] ${message}`);
};
