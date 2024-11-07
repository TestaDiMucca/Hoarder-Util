<script setup lang="ts">
import { FileUploadOptions, useDropzone } from "vue3-dropzone";

import { Storage } from '@shared/common.types';
import { computed, onUnmounted, ref } from 'vue';
import store from '@utils/store';
import { readTextFileAndParseJson } from '@utils/helpers';
import { transformLegacyPipelineMap } from '@utils/transformers'
import { models } from 'src/data/models';

const pipelines = ref<Storage['pipelines']>({});
const selectedIds = ref<Record<string, boolean>>({});

const reset = () => {
  pipelines.value = {};
  selectedIds.value = {};
}

const onDrop: FileUploadOptions['onDrop'] = (acceptFiles: File[], _rejectReasons) => {
  if (acceptFiles.length) {
    readTextFileAndParseJson<Storage['pipelines']>(acceptFiles[0]).then(rawParsed => {
      const parsed = transformLegacyPipelineMap(rawParsed);
      // Needs validation.
      const pipelineList = Object.values(parsed);
      pipelines.value = parsed;
      selectedIds.value = pipelineList.reduce<Record<string, boolean>>((a, v) => {
        if (v.id) a[v.id] = true;
        return a;
      }, {});
    })
  }
}

const handleImport = () => {
  Object.keys(selectedIds.value).forEach(pId => {
    if (!selectedIds.value[pId]) return;

    models.pipeline.upsert({
      ...pipelines.value[pId]
    })
  })

  store.syncPipelineDataFromStorage();

  reset();
};

const handleToggleSelection = (id: string) => {
  const currentValue = selectedIds[id];

  selectedIds.value[id] = !currentValue;
}

const numSelected = computed(() => Object.values(selectedIds.value).filter(v => v).length)
const pipelineList = computed(() => Object.values(pipelines.value ?? {}));

onUnmounted(reset);

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <div v-if="pipelineList.length <= 0" v-bind="getRootProps()" class="cursor-pointer">
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
