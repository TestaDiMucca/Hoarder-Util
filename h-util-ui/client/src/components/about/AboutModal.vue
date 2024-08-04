<script setup lang="ts">
import { ref, watch } from 'vue';
import { StatsStorage } from '@shared/common.types';
import { loadStats } from '@utils/helpers';
import StatsDisplay from './StatsDisplay.vue';

enum Tabs {
  log = 'log',
  stats = 'stat',
  about = 'about'
}

const tab = ref(Tabs.about);
const about = ref(false);
const stats = ref<StatsStorage | null>(null);


const getStats = () => {
  loadStats().then(data => {
    stats.value = data;
  })
}

watch(about, (newValue, oldValue) => {
  if (newValue && !oldValue) getStats();
})
</script>

<template>
  <button @click="about = true">
    About
  </button>

  <q-dialog v-model="about">
    <q-card>
      <q-card-section>
        <div class="text-h6">About</div>
      </q-card-section>

      <q-tabs v-model="tab">
        <q-tab name="about" label="About" />
        <q-tab name="stat" label="Stats" />
        <q-tab name="log" label="Internals" />
      </q-tabs>

      <q-card-section v-if="tab === Tabs.stats">
        <StatsDisplay v-if="stats" :stats="stats" />
      </q-card-section>

      <q-card-section v-if="tab === Tabs.about">
        About
      </q-card-section>

      <q-card-section v-if="tab === Tabs.log">
        Logs
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup="true" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>