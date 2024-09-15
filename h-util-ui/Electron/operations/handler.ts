import { detachPromise, promises, withTimer } from '@common/common';
import { ProcessingModuleType, ProcessingRequest } from '@shared/common.types';
import { messageWindow, updateTaskProgress } from '@util/ipc';
import { CommonContext, FileOptions } from '@util/types';

import { fileListToFileOptions, runProcessingModule } from './handler.helpers';
import { addPipelineRunStat } from '../data/stats.db';

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
    const fileOptions: FileOptions = fileListToFileOptions(filePaths);

    /** Track log only if we need to */
    const hasReporter = pipeline.processingModules.find((m) => m.type === ProcessingModuleType.report);

    let handled = 0;
    let currentModule: ProcessingModuleType = ProcessingModuleType.iterate;
    let timeTaken = 0;
    let handledProgress = 0;

    const commonContext: CommonContext = {
        pipelineId: pipeline.id,
        ...(hasReporter ? { eventLog: [], pipelineName: pipeline.name } : {}),
    };

    await withTimer(
        async () => {
            await promises.each(pipeline.processingModules, async (processingModule) =>
                runProcessingModule(processingModule, fileOptions, {
                    onBeforeRun: () => {
                        currentModule = processingModule.type;
                        handledProgress = Math.ceil((handled / pipeline.processingModules.length) * 100);

                        mainUpdate(currentModule, handledProgress);

                        handled++;
                    },
                    onProgress: (label, progress) => {
                        mainUpdate(currentModule, handledProgress, label, progress);
                    },
                    commonContext,
                }),
            );
        },
        (time) => {
            timeTaken = time;
        },
    );

    if (handled > 0) mainUpdate(currentModule, 100);

    detachPromise({
        cb: async () => {
            await addPipelineRunStat(pipeline.id!, 'times_ran', 1);
            await addPipelineRunStat(pipeline.id!, 'time_taken', timeTaken);
            await addPipelineRunStat(pipeline.id, 'files_processed', fileOptions.filesWithMeta.length);
        },
    });

    messageWindow(`Operation completed in ${timeTaken}ms`);

    taskId++;
};

export const handleClientMessage = (message: string) => {
    console.log(`[client-message] ${message}`);
};
