<script setup lang="ts">
import { FileUploadOptions, useDropzone } from "vue3-dropzone";

import store from '@utils/store';
import { IpcMessageType } from '@shared/common.constants';
import { Pipeline } from '@utils/types';
import { getIpcRenderer, sendMessageToMain } from '@utils/helpers';

interface Props { pipelineItem: Pipeline }

const props = defineProps<Props>()
const ipcRenderer = getIpcRenderer();

const deletePipeline = () =>
  store.removePipeline(props.pipelineItem.id!)

const selectPipeline = () => {
  store.setSelectedPipeline(props.pipelineItem)

  window.location.href = '#/new';
}

const onDrop: FileUploadOptions['onDrop'] = (acceptFiles: File[], _rejectReasons) => {
  if (acceptFiles.length) {
    const payload = {
      filePaths: acceptFiles.map(f => (f as any).path),
      pipeline: props.pipelineItem
    }

    ipcRenderer?.send(IpcMessageType.runPipeline, [JSON.stringify(payload)])
  } else {
    sendMessageToMain('No files detected')
  }
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <q-card :class="{ 'pipeline-drop': isDragActive, 'pipeline-card': true }">
    <div v-bind="getRootProps()" class="cursor-pointer">
      <div class="pipeline-item">
        {{ pipelineItem.name }}
      </div>
      <input v-bind="getInputProps()" />
      <p v-if="isDragActive">Drop the files here ...</p>
      <p v-else>Drop files here, or click to browse</p>
    </div>

    <button @click="deletePipeline">
      Delete
    </button>

    <button @click="selectPipeline">
      Edit
    </button>
  </q-card>
</template>

<style scoped>
.pipeline-item {
  padding: 1em;
  font-weight: 500;
}

.pipeline-drop {
  color: var(--q-lightColor);
  transform: scale(1.05);
  transform-origin: center;
}

.pipeline-card {
  transition: transform 0.5s;
}
</style>