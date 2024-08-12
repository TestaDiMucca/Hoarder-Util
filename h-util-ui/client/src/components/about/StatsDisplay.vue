<script setup lang="ts">
import { computed } from 'vue';
import { StatsStorage } from '@shared/common.types';
import { formatBytes, formatMilliseconds } from '@utils/helpers';

const { stats } = defineProps<{ stats: StatsStorage }>()

const pipelineRunData = computed(() => Object.entries(stats.pipelineRuns)
  .sort(([, valueA], [, valueB]) => valueB - valueA))
</script>

<template>
  <h4>Pipeline invocations</h4>
  <div class="pipeline-stats">
    <div v-for="pipeline in pipelineRunData">
      {{ pipeline[0] }} : {{ pipeline[1] }}
    </div>
  </div>
  <h4>Other</h4>
  <div>
    Time spent processing: {{ formatMilliseconds(stats.msRan) }}
  </div>
  <div>
    Space saved: {{ formatBytes(stats.bytesShaved) }}
  </div>
</template>