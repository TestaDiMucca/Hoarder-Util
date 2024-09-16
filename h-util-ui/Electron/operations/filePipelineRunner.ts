import { ProcessingRequest } from '@shared/common.types';
import { updateTaskProgress } from '@util/ipc';

let taskId = 0;

export const runPipelineForFiles = (params: ProcessingRequest) => {
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

    // take each file individually through the pipeline, using next to determine follow-up module
    // put a cap on module length to prevent infinite loops
    // set up common context, shared across all modules, all files
    // set up data stores indexed by module ID which is passed into handlers

    // for each file, cycle through the modules
};
