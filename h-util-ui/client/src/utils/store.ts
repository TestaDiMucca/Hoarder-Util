import { reactive } from 'vue';

import { Pipeline, TaskQueue } from './types';
import { Aqueduct } from '@shared/common.types';
import { CardStyles } from 'src/components/Pipelines/pipelineGallery.helpers';
import { models } from 'src/data/models';

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

const syncPipelineDataFromStorage = () => {
    const all = models.pipeline.selectAll();

    state.pipelines = all;
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
    syncPipelineDataFromStorage,
    toggleDarkMode,
    setCardStyles,
    setAqueducts,
    setAllPipelines,
    setSelectedPipeline,
};
