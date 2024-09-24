<script setup lang="ts">
import { ref, watch } from 'vue';
import { PipelineStatsPayload } from '@shared/common.types';
import { loadStats, } from '@utils/helpers';
import StatsDisplay from './StatsDisplay.vue';

enum Tabs {
  stats = 'stat',
  about = 'about',
}

const tab = ref(Tabs.about);
const about = ref(false);
const stats = ref<PipelineStatsPayload[] | null>(null);

defineProps<{
  openButton: any;
  openButtonProps?: Record<string, any>;
}>();

const getStats = () => {
  loadStats().then(data => {
    stats.value = data;
  })
}

watch(about, (newValue, oldValue) => {
  /** Only fetch when opening */
  if (newValue && !oldValue) getStats();
})
</script>

<template>
  <component class="icon-button" @click="about = true" :is="openButton" v-bind="openButtonProps ?? {}" />

  <q-dialog v-model="about" backdrop-filter="blur(5px)">
    <q-card>
      <q-card-section style="width: 70vw;">
        <div class="text-h6">About</div>
      </q-card-section>

      <q-tabs v-model="tab">
        <q-tab name="about" label="About" />
        <q-tab name="stat" label="Stats" />
      </q-tabs>

      <q-card-section v-if="tab === Tabs.stats">
        <StatsDisplay v-if="stats" :stats="stats" />
      </q-card-section>

      <q-card-section v-if="tab === Tabs.about">
        H-Util Visual

        Notes on usage:
        <ul>
          <li>Filter modules filter files from rest of the pipeline</li>
          <li></li>
        </ul>

      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup="true" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>