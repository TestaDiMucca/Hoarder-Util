<script setup lang="ts">
import { computed, ref } from 'vue';
import PipelineItem from './PipelineItem.vue';
import store from '@utils/store';
import { SortBy, sortPipelines, SortType } from './pipelineGallery.helpers';

const stateStore = ref(store.state)
const sortBy = ref(SortBy.name)
const sortType = ref(SortType.asc)

const sortedPipelines = computed(() => sortPipelines(Object.values(stateStore.value.pipelines), sortBy.value, sortType.value))
</script>

<template>
  <nav class="sort-opts">
    <q-select class="dropdown" v-model="sortBy" :options="Object.values(SortBy)" label="Sort by"
      :hide-dropdown-icon="true" />
    <q-select class="dropdown" v-model="sortType" :options="Object.values(SortType)" label="Order"
      :hide-dropdown-icon="true" />
  </nav>
  <div class="gallery-container">
    <div v-for="pipeline in sortedPipelines" :key="pipeline.id!" class="gallery-item">
      <PipelineItem :pipeline-item="pipeline" />
    </div>
  </div>
</template>

<style scoped>
.gallery-container {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  justify-content: center;
  gap: 10px
}

.gallery-item {
  min-width: 250px;
}

.sort-opts {
  display: flex;
}

.sort-opts .dropdown {
  width: 100px
}
</style>
