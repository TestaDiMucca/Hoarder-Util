<template>
  <div>
    Current pipelines: {{ Object.keys(stateStore.pipelines).length }}
  </div>

  <div v-for="pipeline in stateStore.pipelines">
    <PipelineItem :pipeline-item="pipeline" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PipelineItem from './PipelineItem.vue';
import store from '../../utils/store';

const stateStore = ref(store.state)
</script>
