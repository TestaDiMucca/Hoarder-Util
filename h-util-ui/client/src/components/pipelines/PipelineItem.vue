<script setup lang="ts">
import store from '../../utils/store';
import { Pipeline } from '../../utils/types';

interface Props { pipelineItem: Pipeline }

const props = defineProps<Props>()

const deletePipeline = () => {
  store.removePipeline(props.pipelineItem.id!);
}

</script>

<template>
  <div class="pipeline-item">
    {{ pipelineItem.name }}
  </div>

  <button @click="deletePipeline">
    Delete
  </button>
</template>

<style scoped>
.pipeline-item {
  padding: 1em
}
</style>