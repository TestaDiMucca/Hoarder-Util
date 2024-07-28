import { promises } from '@common/common';

import { ProcessingRequest } from '../../common/common.types';
import { withFileListHandling } from './handler.helpers';
import { MODULE_MAP } from './modules/moduleMap';

export const handleRunPipeline = async (params: ProcessingRequest) => {
    const { filePaths, pipeline } = params;

    if (filePaths.length === 0 || pipeline.processingModules.length === 0) return;

    await promises.each(pipeline.processingModules, async (processingModule) => {
        const moduleHandler = MODULE_MAP[processingModule.type];

        if (!moduleHandler) {
            console.log(`Module ${processingModule.type} not yet supported`);
            return;
        }

        await withFileListHandling({
            fileList: filePaths,
            clientOptions: processingModule.options,
            moduleHandler,
        });
    });
};

export const handleClientMessage = (message: string) => {
    console.log(`[client-message] ${message}`);
};
