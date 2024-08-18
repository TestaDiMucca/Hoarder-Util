<script setup lang="ts">
import { FileUploadOptions, useDropzone } from "vue3-dropzone";
import Menu from 'vue-material-design-icons/Menu.vue'

import store from '@utils/store';
import { IpcMessageType } from '@shared/common.constants';
import { Pipeline } from '@utils/types';
import { getIpcRenderer, sendMessageToMain } from '@utils/helpers';
import { MODULE_MATERIAL_ICONS } from '@utils/constants';

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
      <nav class="icon-bar">
        <div class="module-icon-container" v-for="pipelineModule in pipelineItem.processingModules">
          <component :is="MODULE_MATERIAL_ICONS[pipelineModule.type]" />
        </div>
      </nav>
    </div>

    <button class="sub-menu button-with-icon-child">
      <Menu class="icon-button" />
      <q-menu>
        <q-list style="min-width: 100px">
          <q-item clickable v-close-popup="true" @click="selectPipeline">
            <q-item-section>Edit</q-item-section>
          </q-item>
          <q-item clickable v-close-popup="true" @click="deletePipeline">
            <q-item-section style="color: red;">Delete</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
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
  position: relative;
}

.icon-bar {
  font-size: smaller;
  display: flex;
  position: relative;
  width: 100%;
  justify-content: center;
  gap: 5px;
  padding: 0.5em;
}

.sub-menu {
  position: absolute;
  top: 4px;
  right: 0;
}
</style>