<script setup lang="ts">
import { ref } from 'vue';
import PipelineItem from './PipelineItem.vue';
import store from '../../utils/store';

const stateStore = ref(store.state)
</script>

<template>
  <div class="gallery-container">
    <div v-for="pipeline in stateStore.pipelines" :key="pipeline.id!" class="gallery-item">
      <PipelineItem :pipeline-item="pipeline" />
    </div>
  </div>

</template>

<style scoped>
.gallery-container {
  display: flex;
  max-width: 95vw;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px
}

.gallery-item {
  min-width: 250px;
}
</style>
