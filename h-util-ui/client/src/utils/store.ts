// store.js
import { reactive } from 'vue';
import { v4 as uuidV4 } from 'uuid';

import { Pipeline, TaskQueue } from './types';
import { saveUserData } from './helpers';

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

const onPipelinesUpdated = () => {
    saveUserData({ ...state.pipelines });
};

const upsertPipeline = (pipeline: Pipeline) => {
    if (!pipeline.id) pipeline.id = uuidV4();

    state.pipelines[pipeline.id!] = pipeline;

    onPipelinesUpdated();
};

const removePipeline = (pipelineId: string) => {
    delete state.pipelines[pipelineId];

    onPipelinesUpdated();
};

const setAllPipelines = (data: VueStore['pipelines']) => {
    state.pipelines = { ...data };
};

export default {
    state,
    upsertPipeline,
    removePipeline,
    setAllPipelines,
};
