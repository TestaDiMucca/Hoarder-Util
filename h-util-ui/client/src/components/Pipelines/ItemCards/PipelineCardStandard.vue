<script setup lang="ts">
import { Pipeline } from '@shared/common.types';
import { MODULE_MATERIAL_ICONS } from '@utils/constants';
import { sendMessageToMain } from '@utils/helpers';
import { computed, CSSProperties } from 'vue';
import { FileUploadOptions, useDropzone } from "vue3-dropzone";
import { ElectronFile } from './itemCards.common';
import PipelineCardDropdown from './PipelineCardDropdown.vue';

interface Props {
  pipelineItem: Pipeline;
  onDrop: (fileList: string[]) => void;
};
const props = defineProps<Props>();

/** For custom color rendering */
const cardStyle = computed(() => props.pipelineItem.color ? {
  boxShadow: `inset 0 0 10px 5px ${props.pipelineItem.color}`, /* Blur effect with a shadow */
  boxSizing: 'border-box'
} satisfies CSSProperties : undefined)

const onDrop: FileUploadOptions['onDrop'] = (acceptFiles: ElectronFile[], _rejectReason) => {
  if (acceptFiles.length) {
    props.onDrop(acceptFiles.map(f => f.path));
  } else {
    sendMessageToMain('No files detected');
  }
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <q-card :class="{ 'pipeline-drop': isDragActive, 'pipeline-card': true, 'has-color': !!pipelineItem.color }">
    <div v-bind="getRootProps()" class="cursor-pointer" :style="cardStyle">
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

    <PipelineCardDropdown class="sub-menu" :pipelineItem="pipelineItem" />
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