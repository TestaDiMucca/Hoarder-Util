import { randomUUID } from 'crypto';

import { promises } from '@common/common';
import output from '@util/output';
import { ProcessingError } from '@util/errors';
import { ProcessingRequest } from '@shared/common.types';

import { withFileListHandling } from './handler.helpers';
import { MODULE_MAP } from './modules/moduleMap';

export const handleRunPipeline = async (params: ProcessingRequest) => {
    const { filePaths, pipeline } = params;

    if (filePaths.length === 0 || pipeline.processingModules.length === 0) return;

    const taskId = randomUUID();
    const pipelineId = pipeline.id ?? randomUUID();

    await promises.each(pipeline.processingModules, async (processingModule) => {
        const moduleHandler = MODULE_MAP[processingModule.type];

        if (!moduleHandler) {
            output.log(`Module ${processingModule.type} not yet supported`);
            return;
        }

        output.log(`Processing module ${processingModule.type}`);

        try {
            /** One module's processing */
            await withFileListHandling({
                fileList: filePaths,
                clientOptions: processingModule.options,
                moduleHandler,
                onProgress: (label, progress) => {},
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
};

export const handleClientMessage = (message: string) => {
    console.log(`[client-message] ${message}`);
};
