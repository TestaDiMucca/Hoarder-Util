// store.js
import { reactive } from 'vue';
import { v4 as uuidV4 } from 'uuid';

import { Pipeline, TaskQueue } from './types';

export type VueStore = {
    pipelines: Record<string, Pipeline>;
    selectedPipeline: Pipeline | null;
    taskQueue: TaskQueue;
};

/** See composition API for more info */
const state = reactive<VueStore>({
    pipelines: {},
    selectedPipeline: null,
    taskQueue: [],
});

const upsertPipeline = (pipeline: Pipeline) => {
    if (!pipeline.id) pipeline.id = uuidV4();

    state.pipelines[pipeline.id!] = pipeline;
};

const removePipeline = (pipelineId: string) => {
    delete state.pipelines[pipelineId];
};

export default {
    state,
    upsertPipeline,
    removePipeline,
};
