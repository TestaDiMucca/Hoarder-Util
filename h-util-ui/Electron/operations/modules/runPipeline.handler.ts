import { ModuleHandler } from '@util/types';
import { Storage } from '@shared/common.types';
import { ProcessingError } from '@util/errors';
import pipelineCache from '@util/cache';
import { runPipelineForFiles } from '../handler';
import { addEventLogForReport } from '../handler.helpers';
import { splitFileNameFromPath } from '@common/fileops';

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

        const { fileName } = splitFileNameFromPath(fileWithMeta.filePath);

        addEventLogForReport(opts, fileName, 'pipeline', targetPipeline.name);

        await runPipelineForFiles({
            pipeline: targetPipeline,
            filePaths: [fileWithMeta.filePath],
        });
    },
};

export default runPipelineHandler;
