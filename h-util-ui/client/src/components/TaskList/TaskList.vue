<script setup lang="ts">
import { computed, ref } from 'vue';
import debounce from 'lodash/debounce';
import { getIpcRenderer } from '@utils/helpers';
import { SpawnedTask } from '@utils/types';
import { MAX_TASKS } from '@utils/constants';
import store from '@utils/store';
import TaskListItem from './TaskListItem.vue';

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
  <div class="list-container">
    <span v-if="sortedTaskList.length === 0" class="nothing">
      No tasks at this moment
    </span>
    <div v-if="sortedTaskList.length > 0">
      <div v-for="spawnedTask in sortedTaskList">
        <TaskListItem :task="spawnedTask" />
      </div>
    </div>
  </div>

</template>

<style scoped>
.list-container {
  /* background: var(--q-backingColor); */
  padding: 1em;
  font-size: x-small;
  border-radius: 5px 5px 0 0;
  width: 70%;
  margin: auto;
  border-top: 1px solid var(--q-lightColor);
  position: relative;
}

.list-container::after {
  content: "";
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--q-backingColor);
  opacity: 0.8;
  mix-blend-mode: multiply;
  backdrop-filter: blur(10px);
}

.nothing {
  opacity: 0.5;
}
</style>