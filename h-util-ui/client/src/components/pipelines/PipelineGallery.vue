<script setup lang="ts">
import { computed, ref } from 'vue';
import Menu from 'vue-material-design-icons/Menu.vue'
import PipelineItem from './PipelineItem.vue';
import store from '@utils/store';
import { CardStyles, SortBy, sortPipelines, SortType } from './pipelineGallery.helpers';

const stateStore = ref(store.state)
const sortBy = ref(SortBy.name)
const sortType = ref(SortType.asc)
const cardStyle = stateStore.value.settings.cardStyle;

const sortedPipelines = computed(() => sortPipelines(Object.values(stateStore.value.pipelines), sortBy.value, sortType.value))
</script>

<template>
  <nav class="sort-opts">
    <button class="expand-opts-btn button-with-icon-child">
      <Menu class="icon-button" />
      <q-tooltip :delay="500" :offset="[0, 10]">Display/sort options</q-tooltip>
      <q-popup-proxy>
        <q-card class="opts-card">
          <q-select class="dropdown" v-model="sortBy" :options="Object.values(SortBy)" label="Sort by"
            :hide-dropdown-icon="true" />
          <q-select class="dropdown" v-model="sortType" :options="Object.values(SortType)" label="Order"
            :hide-dropdown-icon="true" />

        </q-card>
      </q-popup-proxy>
    </button>

  </nav>

  <div v-if="sortedPipelines.length === 0">No pipelines. Create a new pipeline to start mangling files.</div>
  <div
    :class="{ 'gallery-container': true, 'cards-normal': cardStyle !== CardStyles.compact, 'cards-compact': cardStyle === CardStyles.compact }">
    <div v-for="pipeline in sortedPipelines" :key="pipeline.id!" class="gallery-item">
      <PipelineItem :pipeline-item="pipeline" :cardStyle="cardStyle" />
    </div>
  </div>
</template>

<style scoped>
.gallery-container {
  display: grid;
  width: 100%;

  justify-content: center;
  gap: 10px;
  overflow-y: auto;
  padding: 0.5em;
}

.cards-normal {
  grid-template-columns: repeat(auto-fit, minmax(var(--card-size-normal), 1fr));
}

.cards-compact {
  grid-template-columns: repeat(auto-fit, minmax(var(--card-size-compact), 1fr));
}

/* .gallery-item {
  width: min-content;
} */

.sort-opts {
  display: flex;
  justify-content: flex-end;
}

.sort-opts .dropdown {
  width: 100px
}

.expand-opts-btn {
  font-size: 0.5em;
  padding-top: 0
}

.opts-card {
  min-width: 150px;
  padding: 1em;
}
</style>
