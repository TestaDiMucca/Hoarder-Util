<script setup lang="ts">
import { getIpcRenderer } from '@utils/helpers';
import { PipelineOptionsProps } from './pipelineOptions.common';
import { computed } from 'vue';

const props = defineProps<PipelineOptionsProps>();

const handleDirPrompt = async () => {
  const ipcRenderer = getIpcRenderer();

  if (!ipcRenderer) return;

  const folder = await ipcRenderer.selectFolder();
  props.handleOptionChange('value', folder)
}

const directoryDisplay = computed(() => String(props.currentOptions.value ?? '').length ? props.currentOptions.value : 'Select a directory')
</script>

<template>
  <div class="select-directory" @click="handleDirPrompt">{{
    directoryDisplay }}</div>
</template>

<style scoped>
.select-directory {
  cursor: pointer;
}
</style>