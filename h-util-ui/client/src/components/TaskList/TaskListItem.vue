<script setup lang="ts">
import { SpawnedTask } from '@utils/types';

interface Props {
  task: SpawnedTask & { pipelineName: string; }
}

defineProps<Props>();
</script>

<template>
  <div class="task">
    <div class="primary">
      {{ task.pipelineName }} - {{ task.name }} ({{ task.progress }}%)
    </div>
    <div v-if="task.subName" class="secondary">
      {{ task.subName }} ({{ task.subProgress }}%)
    </div>
  </div>
</template>

<style scoped>
.task {
  display: flex;
  flex-direction: column;
}

.primary {
  color: var(--q-lightColor);
}

.secondary {
  font-size: 0.7em;
  ;
}
</style>