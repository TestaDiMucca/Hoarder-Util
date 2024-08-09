<script setup lang="ts">
import { ref } from 'vue';
import PipelineItem from './PipelineItem.vue';
import store from '@utils/store';
import { SortBy, SortType } from './pipelineGallery.helpers';

const stateStore = ref(store.state)
const sortBy = ref(SortBy.name)
const sortType = ref(SortType.asc)

</script>

<template>
  <div>
    <q-select v-model="sortBy" :options="Object.values(SortBy)" label="Sort by" :hide-dropdown-icon="true" />
    <q-select v-model="sortType" :options="Object.values(SortType)" label="Order" :hide-dropdown-icon="true" />
  </div>
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
