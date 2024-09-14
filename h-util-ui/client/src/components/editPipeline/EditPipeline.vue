<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import PlusBox from 'vue-material-design-icons/PlusBox.vue'
import Palette from 'vue-material-design-icons/Palette.vue'
import cloneDeep from 'lodash/cloneDeep';

import { PageViews, ProcessingModule, ProcessingModuleType } from '@utils/types';
import store from '@utils/store';
import { DEFAULT_RANKING, getDefaultModule } from '@utils/constants';
import EditPipelineModule from './EditPipelineModule.vue';
import { navigateTo } from '@utils/helpers';
import PageLayout from 'src/layout/PageLayout.vue';

const pipelineModules = ref<ProcessingModule[]>([
  getDefaultModule()
]);

const pipelineName = ref(`New pipeline ${new Date().toISOString()}`);
const pipelineColor = ref<string>();
const pipelineRanking = ref(DEFAULT_RANKING);

onBeforeMount(() => {
  const selected = store.state.selectedPipeline;

  if (!selected) return;
  pipelineModules.value = cloneDeep(selected.processingModules);
  pipelineName.value = selected.name;
  pipelineColor.value = selected.color;
  pipelineRanking.value = selected.manualRanking ?? DEFAULT_RANKING;
})

const handleModuleUpdated = (newData: ProcessingModule | null, index: number) => {
  const targetedModule = pipelineModules.value[index];

  if (!targetedModule) return;

  /** Null data means to remove the module */
  if (!newData) {
    pipelineModules.value.splice(index, 1);
    return;
  }
  pipelineModules.value[index] = newData;
}

const handleNewModules = () => {
  pipelineModules.value.push(getDefaultModule())
}

const handleSavePipeline = () => {
  store.upsertPipeline({
    id: store.state.selectedPipeline?.id ?? uuidv4(),
    name: pipelineName.value,
    manualRanking: pipelineRanking.value,
    color: pipelineColor.value,
    processingModules: pipelineModules.value
  })

  returnHome()
};

const returnHome = () => {
  store.setSelectedPipeline(null);
  navigateTo(PageViews.Home);
}

const handlePipelineNameUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  pipelineName.value = newValue;
}

const handlePipelineRankingUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  pipelineRanking.value = +newValue;
}

const hasNoModules = computed(() => pipelineModules.value.length === 0)
const header = computed(() => !!store.state.selectedPipeline ? 'Edit pipeline' : 'New pipeline');
</script>

<template>
  <PageLayout>
    <template #top-bar>
      <span>{{ header }}</span>
    </template>
    <template #content>
      <section class="pipeline-opts">
        <q-input type="text" class="text-input input-field" label="Pipeline name" v-model="pipelineName"
          @input="handlePipelineNameUpdated" />
        <q-input type="number" class="number-input input-field" label="Pipeline rank" v-model="pipelineRanking"
          @input="handlePipelineRankingUpdated" />
        <q-input v-model="pipelineColor" :rules="pipelineColor === '' ? [] : ['anyColor']" label="Display color"
          class="color-input" no-error-icon>
          <template v-slot:append>
            <button class="button-with-icon-child">
              <Palette class="icon-button cursor-pointer"
                :style="pipelineColor ? { color: pipelineColor } : undefined" />
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color no-footer v-model="pipelineColor" />
              </q-popup-proxy>
            </button>
          </template>
          <template v-slot:error>
            Not a valid color
          </template>
        </q-input>
      </section>

      <q-card-section class="modules-container" v-for="(pipelineModule, index) in pipelineModules">
        <EditPipelineModule v-if="pipelineModule.type !== ProcessingModuleType.branch"
          :handleModuleUpdated="handleModuleUpdated" :processing-module="pipelineModule" :index="index" />
        <div v-if="index < pipelineModules.length - 1" class="line" />
        <div v-if="index === pipelineModules.length - 1" class="line line-end" />
      </q-card-section>

      <q-card-section @click="handleNewModules" class="modules-container">
        <q-card class="new-module-card p-2">
          <PlusBox class="icon-button" />
          <span>Add a module</span>
        </q-card>
      </q-card-section>
    </template>
    <template #footer>
      <button @click="returnHome">
        Cancel
      </button>
      <button :disabled="hasNoModules" @click="handleSavePipeline">
        Save pipeline
      </button>
    </template>
  </PageLayout>
</template>

<style scoped>
.pipeline-opts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 1em;
  width: 100%;
  padding: 0 10em;
}

.pipeline-opts .text {
  min-width: 150px;
}

.modules-container {
  min-width: 300px;
  width: 70%;
  margin: auto;
  position: relative;
}

.line {
  height: 20px;
  width: 2px;
  background: var(--q-lightColor);
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateY(50%);
}

.line-end {
  opacity: 0.4;
}

.new-module-card {
  padding: 1em;
  width: 100%;
  cursor: pointer;
  justify-content: center;
  display: flex;
  gap: 5px;
}

.color-input button {
  margin: 0;
  padding: 1em 0 0;
}
</style>
