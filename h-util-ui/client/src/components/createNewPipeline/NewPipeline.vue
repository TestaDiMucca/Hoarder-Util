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

const handleModuleUpdated = (newData: ProcessingModule, index: number) => {
  const targetedModule = pipelineModules.value[index];

  if (!targetedModule) return;
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
</script>

<template>
  <div>
    <h3>New pipeline</h3>

    <div v-for="(pipelineModule, index) in pipelineModules">
      <NewPipelineModule :handleModuleUpdated="handleModuleUpdated" :processing-module="pipelineModule"
        :index="index" />
    </div>

    <button @click="handleNewModules">
      Add a module
    </button>

    <button @click="handleSavePipeline">
      Save pipeline
    </button>
  </div>

  <a href="#/">
    Cancel
  </a>
</template>
