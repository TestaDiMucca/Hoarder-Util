<script setup lang="ts">
import { ref } from 'vue';
import { ProcessingModule, ProcessingModuleType } from '../../utils/types';

const pipelineModules = ref<ProcessingModule[]>([
  {
    type: ProcessingModuleType.datePrefix,
    options: {
      value: ''
    }
  }
]);

const handleModuleSelect = (moduleType: ProcessingModuleType, index: number) => {
  alert(String(moduleType + index))
}
</script>

<template>
  <div>
    <h3>New pipeline</h3>

    <div v-for="(_pipelineModule, i) in pipelineModules">
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

  </div>

  <a href="#/">
    Cancel
  </a>
</template>
