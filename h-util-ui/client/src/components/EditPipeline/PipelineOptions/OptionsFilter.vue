<script setup lang="ts">
import { computed } from 'vue';
import { FileUploadOptions, useDropzone } from "vue3-dropzone";

import { PipelineOptionsProps } from './pipelineOptions.common';
import { OPTION_LABELS } from '@utils/constants';
import { getIpcRenderer } from '@utils/helpers';

const props = defineProps<PipelineOptionsProps>();

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  props.handleOptionChange('value', newValue);
}

const optionLabel = computed(() => OPTION_LABELS[props.moduleType]);

const onDrop: FileUploadOptions['onDrop'] = async (acceptFiles: File[], _rejectReasons) => {
  if (acceptFiles.length) {
    const ipcRenderer = getIpcRenderer();

    if (!ipcRenderer) return;

    const res = await ipcRenderer.testFilter({
      filePaths: acceptFiles.map(f => (f as any).path), filter: String(props.currentOptions.value), invert: !!props.currentOptions.inverse
    });

    console.log(res);
  }
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

</template>
