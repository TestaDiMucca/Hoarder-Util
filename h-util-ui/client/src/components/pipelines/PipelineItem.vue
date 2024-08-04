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
    ipcRenderer?.send(IpcMessageType.runPipeline, [JSON.stringify({ filePaths: acceptFiles.map(f => (f as any).path), pipeline: props.pipelineItem })]
    )
  } else {
    sendMessageToMain('No files detected')
  }
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <q-card>
    <div v-bind="getRootProps()" class="cursor-pointer">
      <div class="pipeline-item">
        {{ pipelineItem.name }}
      </div>
      <input v-bind="getInputProps()" />
      <p v-if="isDragActive">Drop the files here ...</p>
      <p v-else>Drag 'n' drop some files here, or click to select files</p>
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
</style>