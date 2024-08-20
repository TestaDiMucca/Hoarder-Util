<script setup lang="ts">
import { computed, ref } from 'vue';
import { FileUploadOptions, useDropzone } from "vue3-dropzone";

import { PipelineOptionsProps } from './pipelineOptions.common';
import { OPTION_LABELS } from '@utils/constants';
import { getIpcRenderer } from '@utils/helpers';
import UmuLoader from 'src/components/common/UmuLoader.vue';

const props = defineProps<PipelineOptionsProps>();
const showList = ref(false);
const fileList = ref<string[] | null>(null);

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  props.handleOptionChange('value', newValue);
}

const optionLabel = computed(() => OPTION_LABELS[props.moduleType]);

const onDrop: FileUploadOptions['onDrop'] = async (acceptFiles: File[], _rejectReasons) => {
  if (acceptFiles.length) {
    const ipcRenderer = getIpcRenderer();
    if (!ipcRenderer) return;

    showList.value = true;

    const res = await ipcRenderer.testFilter({
      filePaths: acceptFiles.map(f => (f as any).path), filter: String(props.currentOptions.value), invert: !!props.currentOptions.inverse
    });

    fileList.value = res;
  }
}

const clearFiles = () => {
  fileList.value = null;
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <section class="filter-options">
    <q-input v-if="optionLabel" type="text" v-model="currentOptions.value" @input="handleModuleOptionUpdated"
      :label="optionLabel ?? ''" />

    <div class="dropzone" v-if="currentOptions.value" v-bind="getRootProps()">
      <input v-bind="getInputProps()" />
      <p v-if="isDragActive">Drop the files here ...</p>
      <p v-else>Drop files here, or click to browse to test</p>
    </div>
  </section>

  <q-dialog v-model="showList" backdrop-filter="blur(5px)" @hide="clearFiles">
    <q-card class="file-list-card">
      <q-card-section class="file-list-content">
        <div v-if="fileList === null" class="loader-container no-files">
          <UmuLoader />
        </div>
        <div v-else class="file-list-content">
          <div v-if="fileList.length === 0">No files were filtered out</div>
          <div v-if="fileList.length > 0">These files were filtered out:</div>
          <div v-for="fileName in fileList" class="file-list-item">
            › {{ fileName }}
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="actions-bar" align="right">
        <q-btn flat label="Close" color="primary" v-close-popup="true" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.file-list-content {
  height: 100%;
  padding: 1em;
  overflow-y: auto;
}

.file-list-item {
  color: red;
}

.file-list-card {
  width: 80vw;
  min-width: 500px;
  min-height: 200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.no-files {
  height: 100%;
}

.file-list-content {
  flex-grow: 1;
}

.actions-bar {
  height: min-content;
}

.dropzone {
  width: 80%;
  margin: auto;
  padding: 1em;
  margin-top: 5px;
  border: 1px dashed gray;
  cursor: pointer;
}

.dropzone p {
  margin: 0;
}
</style>