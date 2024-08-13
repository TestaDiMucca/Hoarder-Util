<script setup lang="ts">
import { FileUploadOptions, useDropzone } from "vue3-dropzone";

import { Storage } from '@shared/common.types';
import { computed, ref } from 'vue';
import store from '@utils/store';

const pipelines = ref<Storage['pipelines']>({});
const selectedIds = ref<Record<string, boolean>>({});

const onDrop: FileUploadOptions['onDrop'] = (acceptFiles: File[], _rejectReasons) => {
  if (acceptFiles.length) {
    const reader = new FileReader();

    reader.readAsText(acceptFiles[0]);

    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content) as Storage['pipelines'];
      // Needs validation.
      const pipelineList = Object.values(parsed);
      pipelines.value = parsed;
      selectedIds.value = pipelineList.reduce<Record<string, boolean>>((a, v) => {
        if (v.id) a[v.id] = true;
        return a;
      }, {});
    }

    reader.onerror = () => {
      // Error catch/report here
    }
  }
}

const handleImport = () => {
  Object.keys(selectedIds.value).forEach(pId => {
    if (!selectedIds.value[pId]) return;
    store.upsertPipeline({
      ...pipelines[pId]
    })
  })
};

const handleToggleSelection = (id: string) => {
  const currentValue = selectedIds[id];

  selectedIds.value[id] = !currentValue;
}

const numSelected = computed(() => Object.values(selectedIds.value).filter(v => v).length)
const pipelineList = computed(() => Object.values(pipelines));

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <div v-if="pipelineList.length === 0" v-bind="getRootProps()" class="cursor-pointer">
    <input v-bind="getInputProps()" />
    <p v-if="isDragActive">Drop the files here ...</p>
    <p v-else>Drop files here, or click to browse</p>
  </div>

  <div v-if="pipelineList.length > 0">
    <div v-for="pipeline in pipelines">
      <q-checkbox v-model:model-value="selectedIds[pipeline.id!]" @change="handleToggleSelection(pipeline.id!)" />
      <span>{{ pipeline.name }}</span>
    </div>

    <button @click="handleImport" :disabled="numSelected === 0">
      Import selected
    </button>
  </div>
</template>
