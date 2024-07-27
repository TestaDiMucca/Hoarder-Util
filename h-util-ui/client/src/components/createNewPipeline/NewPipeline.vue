<script setup lang="ts">
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { ProcessingModule } from '../../utils/types';
import store from '../../utils/store';
import { getDefaultModule } from '../../utils/constants';
import NewPipelineModule from './NewPipelineModule.vue';

/** Replace with prop if any. */
const pipelineModules = ref<ProcessingModule[]>([
  getDefaultModule()
]);

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
    id: uuidv4(),
    name: `Test pipeline ${Date.now()}`,
    processingModules: pipelineModules.value
  })

  window.location.href = '#/';
};

const hasModules = ref(pipelineModules.value.length > 0)
</script>

<template>
  <q-card class="ui-card">
    <h3>New pipeline</h3>

    <q-card-section v-for="(pipelineModule, index) in pipelineModules">
      <NewPipelineModule :handleModuleUpdated="handleModuleUpdated" :processing-module="pipelineModule"
        :index="index" />
    </q-card-section>

    <button @click="handleNewModules">
      Add a module
    </button>

    <button :disabled="hasModules" @click="handleSavePipeline">
      Save pipeline
    </button>
  </q-card>

  <a href="#/">
    Cancel
  </a>
</template>
