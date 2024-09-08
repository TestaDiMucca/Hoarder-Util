<script setup lang="ts">
import { computed, ref } from 'vue';
import { FileUploadOptions, useDropzone } from "vue3-dropzone";
import Menu from 'vue-material-design-icons/DotsVertical.vue'

import store from '@utils/store';
import { IpcMessageType } from '@shared/common.constants';
import { PageViews, Pipeline } from '@utils/types';
import { getIpcRenderer, navigateTo, sendMessageToMain } from '@utils/helpers';
import { MODULE_MATERIAL_ICONS } from '@utils/constants';
import DeleteConfirmModal from '../common/DeleteConfirmModal.vue';

interface Props { pipelineItem: Pipeline }

/** Electron supplements file path */
type ElectronFile = File & { path: string };

const props = defineProps<Props>()
const ipcRenderer = getIpcRenderer();
const confirmDelete = ref(false);

const deletePipeline = () =>
  store.removePipeline(props.pipelineItem.id!)

const selectPipeline = () => {
  store.setSelectedPipeline(props.pipelineItem)

  navigateTo(PageViews.Edit);
}

const duplicatePipeline = () => {
  const { id, ...pipelineData } = props.pipelineItem;

  const created = store.upsertPipeline({ ...pipelineData, name: `${pipelineData.name} - copy` });

  if (!created) return;

  setTimeout(() => {
    store.setSelectedPipeline(created);
    navigateTo(PageViews.Edit);
  }, 1000);
}

const onDrop: FileUploadOptions['onDrop'] = (acceptFiles: ElectronFile[], _rejectReasons) => {
  if (acceptFiles.length) {
    const payload = {
      filePaths: acceptFiles.map(f => f.path),
      pipeline: props.pipelineItem
    }

    /**
     * Not a network request so not dealing with compressing the payload or using an id only
     * There may be cost in serializing the pipeline but either seems trivial at this point but
     * may improve in the future
     */
    ipcRenderer?.send(IpcMessageType.runPipeline, [JSON.stringify(payload)])
  } else {
    sendMessageToMain('No files detected')
  }
}

const cardStyle = computed(() => props.pipelineItem.color ? {
  boxShadow: `inset 0 0 10px 5px ${props.pipelineItem.color}`, /* Blur effect with a shadow */
  boxSizing: 'border-box'
} : undefined)

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <q-card :class="{ 'pipeline-drop': isDragActive, 'pipeline-card': true, 'has-color': !!pipelineItem.color }"
    :style="cardStyle">
    <div v-bind="getRootProps()" class="cursor-pointer">
      <div class="pipeline-item">
        {{ pipelineItem.name }}
      </div>
      <input v-bind="getInputProps()" />
      <p v-if="isDragActive">Drop the files here ...</p>
      <p v-else>Drop files here, or
        <span class="pipeline-drop-click-text">click to browse</span>
      </p>
      <nav class="icon-bar">
        <div class="module-icon-container" v-for="pipelineModule in pipelineItem.processingModules">
          <component :is="MODULE_MATERIAL_ICONS[pipelineModule.type]" />
          <q-tooltip :delay="500" :offset="[0, 10]">{{ pipelineModule.type }}</q-tooltip>
        </div>
      </nav>
    </div>

    <button class="sub-menu button-with-icon-child">
      <Menu class="icon-button" :size="18" />
      <q-menu>
        <q-list style="min-width: 100px">
          <q-item clickable v-close-popup="true" @click="selectPipeline">
            <q-item-section>Edit</q-item-section>
          </q-item>
          <q-item clickable v-close-popup="true" @click="duplicatePipeline">
            <q-item-section>Duplicate</q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-close-popup="true" @click="confirmDelete = true">
            <q-item-section style="color: red;">Delete</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </button>

    <DeleteConfirmModal v-model="confirmDelete" :onConfirm="deletePipeline" :deleteTargetName="pipelineItem.name" />
  </q-card>
</template>

<style scoped>
.has-color {
  /* Border size fixed, but color is dynamic */
  /* border: 5px solid transparent; */
  box-sizing: border-box;
}

.pipeline-item {
  padding: 1em;
  font-weight: 500;
}

.pipeline-drop {
  color: var(--q-lightColor);
  transform: scale(1.05);
  transform-origin: center;
}

.pipeline-drop-click-text {
  transition: color 0.5s;
}

.pipeline-card:hover .pipeline-drop-click-text {
  color: var(--q-lightColor);
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
  top: 8px;
  right: 0;
}
</style>