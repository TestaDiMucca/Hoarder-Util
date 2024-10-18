import path from 'path';
import { readdir } from 'fs/promises';
import { promises } from '@common/common';
import { AqueductMessage } from '@shared/common.types';
import { runPipelineForFiles } from './handler';
import { sendRendererMessage } from '@util/ipc';

export const handleAqueductMessage = async (message: AqueductMessage) => {
    switch (message.type) {
        case 'load':
            /** @deprecated */
            return;
        case 'run':
            const { aqueduct } = message;

            const response = await sendRendererMessage({
                type: 'requestPipeline',
                pipelineUuid: aqueduct.pipelineId,
            });

            const pipeline = response.type === 'pipelineData' ? response.pipeline : null;

            if (!pipeline) return;

            const directories: string[] = aqueduct.directories;

            await promises.each(directories, async (directory) => {
                try {
                    const filePaths = (await readdir(directory)).map((file) => path.join(directory, file));

                    await runPipelineForFiles({
                        pipeline,
                        filePaths,
                    });
                } catch (e) {
                    console.error(e);
                }
            });
            break;
        case 'delete':
            /** @deprecated */
            break;
        case 'save':
            /** @deprecated */
            break;
        default:
    }
};
