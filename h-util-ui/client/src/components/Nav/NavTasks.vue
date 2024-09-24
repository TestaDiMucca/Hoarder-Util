<script setup lang="ts">
import { computed, ref } from 'vue';
import debounce from 'lodash/debounce';
import { getIpcRenderer } from '@utils/helpers';
import { SpawnedTask } from '@utils/types';
import { MAX_TASKS } from '@utils/constants';
import store from '@utils/store';
import NavTaskItem from './NavTaskItem.vue';
import Sleep from 'vue-material-design-icons/Sleep.vue'

const existingTasks = ref<Record<number, SpawnedTask>>({});
const lowestId = ref<number>(0);

const ipcRenderer = getIpcRenderer();

const handleTaskProgress = debounce((stringified) => {
  const updatedTask = JSON.parse(stringified) as SpawnedTask;

  existingTasks.value[updatedTask.id] = Object.assign((existingTasks.value[updatedTask.id] ?? {}), updatedTask);

  /** Handle overflow removal */
  if (Object.keys(existingTasks.value).length >= MAX_TASKS) delete existingTasks.value[lowestId.value];
}, 200, {
  leading: true,
  trailing: true
})

ipcRenderer?.onTaskProgress(handleTaskProgress)

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
  <q-scroll-area class="task-area">
    <q-list class="task-container">
      <NavTaskItem v-for="spawnedTask in sortedTaskList" :key="spawnedTask.id" :task="spawnedTask" />
      <Sleep v-if="sortedTaskList.length === 0" class="no-tasks" />
      <q-tooltip v-if="sortedTaskList.length === 0" :delay="500" :offset="[0, 10]">No current tasks</q-tooltip>
    </q-list>
  </q-scroll-area>
</template>

<style scoped>
.task-area {
  position: absolute;
  bottom: 1em;
  width: 100%;

  height: 100px;
  /* overflow-y: auto; */

  border-top: 1px solid gray;
}

.task-container {
  width: 100%;

}

.no-tasks {
  opacity: 0.5;
}

.no-tasks svg {
  margin-top: 1em;
}
</style>