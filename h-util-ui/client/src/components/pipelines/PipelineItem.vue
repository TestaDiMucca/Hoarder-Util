<script setup lang="ts">
import { FileUploadOptions, useDropzone } from "vue3-dropzone";

import store from '../../utils/store';
import { IpcMessageType } from '../../../../common/common.constants';
import { Pipeline } from '../../utils/types';
import { getIpcRenderer, sendMessageToMain } from '../../utils/helpers';

interface Props { pipelineItem: Pipeline }

const props = defineProps<Props>()
const ipcRenderer = getIpcRenderer();

const deletePipeline = () => {
  store.removePipeline(props.pipelineItem.id!);
}

const onDrop: FileUploadOptions['onDrop'] = (acceptFiles: File[], rejectReasons) => {
  console.log(acceptFiles);
  console.log(rejectReasons);
  if (acceptFiles.length) {
    ipcRenderer?.send(IpcMessageType.runPipeline, [JSON.stringify({ filePaths: acceptFiles.map(f => (f as any).path), pipeline: props.pipelineItem })]
    )
  } else {
    sendMessageToMain('No files detected')
  }
}

const { getRootProps, getInputProps, isDragActive, open: openFileSelect } = useDropzone({ onDrop });
</script>

<template>
  <q-card v-bind="getRootProps()">
    <input v-bind="getInputProps()" />
    <p v-if="isDragActive">Drop the files here ...</p>
    <p v-else>Drag 'n' drop some files here, or click to select files</p>
    <div class="pipeline-item">
      {{ pipelineItem.name }}
    </div>

    <button @click="openFileSelect">Choose files</button>

    <button @click="deletePipeline">
      Delete
    </button>
  </q-card>
</template>

<style scoped>
.pipeline-item {
  padding: 1em
}
</style>