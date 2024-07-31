<script setup lang="ts">
import { computed, ref } from 'vue';
import { getIpcRenderer } from '../utils/helpers';
import { SpawnedTask } from '../utils/types';
import { MAX_TASKS } from '../utils/constants';
import store from '../utils/store';

const existingTasks = ref<Record<number, SpawnedTask>>({});
const lowestId = ref<number>(0);

const ipcRenderer = getIpcRenderer();

ipcRenderer?.onTaskProgress((stringified) => {
  const updatedTask = JSON.parse(stringified) as SpawnedTask;

  existingTasks.value[updatedTask.id] = updatedTask;

  if (Object.keys(existingTasks.value).length >= MAX_TASKS) delete existingTasks.value[lowestId.value];
})

const sortedTaskList = computed(() => {
  const list = Object.values(existingTasks.value)
    .sort((a, b) => b.id - a.id).map(a => ({
      ...a,
      pipelineName: store.state.pipelines[a.pipelineId]?.name
    }))

  const lastItem = list.length > 1 ? list[list.length - 1] : null;
  lowestId.value = lastItem?.id ?? 0;

  return list;
})
</script>

<template>
  <span v-if="sortedTaskList.length === 0">
    No tasks at this moment
  </span>
  <div v-if="sortedTaskList.length > 0">
    <div v-for="spawnedTask in sortedTaskList">
      {{ spawnedTask.pipelineName }} - {{ spawnedTask.name }} ({{ spawnedTask.progress }}%)
    </div>
  </div>
</template>
