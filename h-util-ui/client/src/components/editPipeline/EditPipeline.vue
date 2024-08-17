<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { ProcessingModule } from '@utils/types';
import store from '@utils/store';
import { DEFAULT_RANKING, getDefaultModule } from '@utils/constants';
import EditPipelineModule from './EditPipelineModule.vue';

/** Replace with prop if any. */
const pipelineModules = ref<ProcessingModule[]>([
  getDefaultModule()
]);

const pipelineName = ref(`New pipeline ${new Date().toISOString()}`);
const pipelineRanking = ref(DEFAULT_RANKING);

onMounted(() => {
  const selected = store.state.selectedPipeline;

  if (!selected) return;
  pipelineModules.value = selected.processingModules;
  pipelineName.value = selected.name;
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
    processingModules: pipelineModules.value
  })

  store.setSelectedPipeline(null);

  returnHome()
};

const returnHome = () => {
  window.location.href = '#/';
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
  <q-card class="ui-card">
    <h5>{{ header }}</h5>

    <section class="pipeline-opts">
      <q-input type="text" class="text-input input-field" label="Pipeline name" v-model="pipelineName"
        @input="handlePipelineNameUpdated" />
      <q-input type="number" class="number-input input-field" label="Pipeline rank" v-model="pipelineRanking"
        @input="handlePipelineRankingUpdated" />
    </section>

    <q-card-section class="modules-container" v-for="(pipelineModule, index) in pipelineModules">
      <EditPipelineModule :handleModuleUpdated="handleModuleUpdated" :processing-module="pipelineModule"
        :index="index" />
      <div v-if="index < pipelineModules.length - 1" class="line" />
    </q-card-section>

    <button @click="handleNewModules">
      Add a module
    </button>
  </q-card>

  <nav>
    <button @click="returnHome">
      Cancel
    </button>
    <button :disabled="hasNoModules" @click="handleSavePipeline">
      Save pipeline
    </button>
  </nav>
</template>

<style scoped>
.ui-card {
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

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
</style>
