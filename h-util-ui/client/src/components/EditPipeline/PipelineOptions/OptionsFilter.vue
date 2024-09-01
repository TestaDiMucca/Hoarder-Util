<script setup lang="ts">
import { computed, ref } from 'vue';

import { PipelineOptionsProps } from './pipelineOptions.common';
import { OPTION_LABELS } from '@utils/constants';
import { getIpcRenderer } from '@utils/helpers';
import FileListModal from './FileListModal.vue';
import MiniFileDrop from 'src/components/common/MiniFileDrop.vue';
import { FilterTestRequest, ProcessingModuleType } from '@shared/common.types';
import { IpcMessageType } from '@shared/common.constants';

const props = defineProps<PipelineOptionsProps & { additionalHelp?}>();
const showList = ref(false);
const fileList = ref<string[] | null>(null);

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  props.handleOptionChange('value', newValue);
}

const optionLabel = computed(() => OPTION_LABELS[props.moduleType]);

const handleDroppedFiles = async (filePaths: string[]) => {

  const ipcRenderer = getIpcRenderer();
  if (!ipcRenderer) return;

  showList.value = true;

  const res = await ipcRenderer.invoke<FilterTestRequest, string[]>(IpcMessageType.runTest, {
    type: ProcessingModuleType.filter,
    filePaths,
    filter: String(props.currentOptions.value), invert: !!props.currentOptions.inverse
  })

  fileList.value = res;

}

const clearFiles = () => {
  fileList.value = null;
}
</script>

<template>
  <section class="filter-options">
    <component v-if="!!additionalHelp" :is="additionalHelp" />
    <q-input v-if="optionLabel" type="text" v-model="currentOptions.value" @input="handleModuleOptionUpdated"
      :label="optionLabel ?? ''" />

    <MiniFileDrop v-if="currentOptions.value" :handleDroppedFiles="handleDroppedFiles" />
  </section>

  <FileListModal v-model="showList" :fileList="fileList" :onHide="clearFiles" action="filtered" />
</template>

<style scoped>
.no-files {
  height: 100%;
}



.actions-bar {
  height: min-content;
}
</style>