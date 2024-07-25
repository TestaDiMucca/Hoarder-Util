<script setup lang="ts">
import { ref } from 'vue';
import { ProcessingModule, ProcessingModuleType } from '../../utils/types';
import store from '../../utils/store';
import { randomUUID } from 'crypto';
import { getDefaultModule } from '../../utils/constants';

const pipelineModules = ref<ProcessingModule[]>([
  getDefaultModule()
]);

const handleModuleSelect = (moduleType: ProcessingModuleType, index: number) => {
  const targetedModule = pipelineModules.value[index];

  if (!targetedModule) return;
  targetedModule.type = moduleType;
}

const handleNewModules = () => {
  pipelineModules.value.push(getDefaultModule())
}

const handleSavePipeline = () => {
  store.upsertPipeline({
    id: randomUUID(),
    name: `Test pipeline ${Date.now()}`,
    processingModules: pipelineModules.value
  })
};
</script>

<template>
  <div>
    <h3>New pipeline</h3>

    <div v-for="(pipelineModule, i) in pipelineModules">
      <span>Selected : {{ pipelineModule.type }}</span>
      <q-btn color="primary" label="Module Type">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item @click="handleModuleSelect(ProcessingModuleType.subfolder, i)" clickable v-close-popup>
              <q-item-section>Place in directory</q-item-section>
            </q-item>
            <q-separator />
            <q-item @click="handleModuleSelect(ProcessingModuleType.metadata, i)" clickable v-close-popup>
              <q-item-section>Metadata tag</q-item-section>
            </q-item>
            <q-item @click="handleModuleSelect(ProcessingModuleType.datePrefix, i)" clickable v-close-popup>
              <q-item-section>Date prefix</q-item-section>
            </q-item>
            <q-separator />
            <q-item @click="handleModuleSelect(ProcessingModuleType.compressImage, i)" clickable v-close-popup>
              <q-item-section>Compress image</q-item-section>
            </q-item>
            <q-item @click="handleModuleSelect(ProcessingModuleType.compressVideo, i)" clickable v-close-popup>
              <q-item-section>Compress video</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
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
