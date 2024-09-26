import { reactive } from 'vue';
import { v4 as uuidV4 } from 'uuid';

import { Pipeline, TaskQueue } from './types';
import { saveUserData } from './helpers';
import { Aqueduct } from '@shared/common.types';
import { CardStyles } from 'src/components/Pipelines/pipelineGallery.helpers';

export type AppSettings = {
    cardStyle: CardStyles;
    darkMode: boolean;
};

export type VueStore = {
    pipelines: Record<string, Pipeline>;
    aqueducts: Aqueduct[] | null;
    selectedPipeline: Pipeline | null;
    taskQueue: TaskQueue;
    settings: AppSettings;
};

/** See composition API for more info */
const state = reactive<VueStore>({
    pipelines: {},
    aqueducts: null,
    selectedPipeline: null,
    taskQueue: [],
    settings: {
        cardStyle: CardStyles.standard,
        darkMode: true,
    },
});

const onPipelinesUpdated = () => {
    saveUserData({ ...state.pipelines });
};

// TODO: Send to main node process instead and refetch
const upsertPipeline = (pipeline: Pipeline) => {
    if (!pipeline.id) {
        pipeline.id = uuidV4();
        pipeline.created = new Date().toISOString();
    }

    pipeline.modified = new Date().toISOString();

    state.pipelines[pipeline.id!] = pipeline;

    onPipelinesUpdated();

    return pipeline;
};

const removePipeline = (pipelineId: string) => {
    delete state.pipelines[pipelineId];

    onPipelinesUpdated();
};

const setAllPipelines = (data: VueStore['pipelines']) => {
    state.pipelines = { ...data };
};

const setSelectedPipeline = (pipeline: Pipeline | null) => {
    state.selectedPipeline = pipeline;
};

const setAqueducts = (aqueducts: Aqueduct[]) => {
    state.aqueducts = aqueducts;
};

const setCardStyles = (cardStyle: CardStyles) => {
    state.settings.cardStyle = cardStyle;
};

const toggleDarkMode = () => {
    state.settings.darkMode = !state.settings.darkMode;
};

export default {
    state,
    toggleDarkMode,
    setCardStyles,
    setAqueducts,
    upsertPipeline,
    removePipeline,
    setAllPipelines,
    setSelectedPipeline,
};
