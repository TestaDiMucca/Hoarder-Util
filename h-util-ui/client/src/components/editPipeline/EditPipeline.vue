<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { ProcessingModule } from '@utils/types';
import store from '@utils/store';
import { getDefaultModule } from '@utils/constants';
import EditPipelineModule from './EditPipelineModule.vue';

/** Replace with prop if any. */
const pipelineModules = ref<ProcessingModule[]>([
  getDefaultModule()
]);

const pipelineName = ref(`New pipeline ${new Date().toISOString()}`);

onMounted(() => {
  const selected = store.state.selectedPipeline;

  if (!selected) return;
  pipelineModules.value = selected.processingModules;
  pipelineName.value = selected.name;
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
    processingModules: pipelineModules.value
  })

  store.setSelectedPipeline(null);

  window.location.href = '#/';
};

const handlePipelineNameUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  pipelineName.value = newValue;
}

const hasNoModules = computed(() => pipelineModules.value.length === 0)
const header = computed(() => !!store.state.selectedPipeline ? 'Edit pipeline' : 'New pipeline');
</script>

<template>
  <q-card class="ui-card">
    <h3>{{ header }}</h3>

    <input type="text" v-model="pipelineName" @input="handlePipelineNameUpdated" />

    <q-card-section v-for="(pipelineModule, index) in pipelineModules">
      <EditPipelineModule :handleModuleUpdated="handleModuleUpdated" :processing-module="pipelineModule"
        :index="index" />
    </q-card-section>

    <button @click="handleNewModules">
      Add a module
    </button>

    <button :disabled="hasNoModules" @click="handleSavePipeline">
      Save pipeline
    </button>
  </q-card>

  <a href="#/">
    Cancel
  </a>
</template>
