import { promises } from '@common/common';
import { ModuleHandler } from '@util/types';
import { runProcessingModule } from '../handler.helpers';
import { Storage } from '@shared/common.types';
import { ProcessingError } from '@util/errors';
import pipelineCache from '@util/cache';

type StoredPipelines = {
    pipelines?: Storage['pipelines'];
};

const runPipelineHandler: ModuleHandler<{}, StoredPipelines> = {
    handler: async (fileWithMeta, opts, dataStore) => {
        if (!dataStore.pipelines) {
            const loaded = pipelineCache.getPipelines();

            if (!loaded) throw new Error('Could not load pipelines');

            dataStore.pipelines = loaded;
        }

        if (!opts.clientOptions?.value) throw new ProcessingError('No target pipeline id provided');

        const targetPipeline = dataStore.pipelines[opts.clientOptions.value];

        if (!targetPipeline) throw new ProcessingError('Target pipeline not found');

        await promises.each(targetPipeline.processingModules, async (processingModule) =>
            runProcessingModule(
                processingModule,
                { filesWithMeta: [fileWithMeta] },
                {
                    commonContext: opts.context,
                },
            ),
        );
    },
};

export default runPipelineHandler;
