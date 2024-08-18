<script setup lang="ts">
import { ref, watch } from 'vue';
import { StatsStorage } from '@shared/common.types';
import { getIpcRenderer, loadStats, loadUserData } from '@utils/helpers';
import StatsDisplay from './StatsDisplay.vue';
import InternalsDisplay from './InternalsDisplay.vue';
import PipelineImport from './PipelineImport.vue';

enum Tabs {
  internals = 'internals',
  stats = 'stat',
  about = 'about',
  import = 'import'
}

const tab = ref(Tabs.about);
const about = ref(false);
const stats = ref<StatsStorage | null>(null);

// Define props using the defineProps function
defineProps<{
  openButton: any;
  openButtonProps?: Record<string, any>;
}>();

const getStats = () => {
  loadStats().then(data => {
    stats.value = data;
  })
}

const handleExportPipelines = () => {
  loadUserData().then(data => {
    if (!data?.pipelines) return;

    getIpcRenderer()?.saveFile(JSON.stringify(data.pipelines));
  })
}

const handleImportPipelines = () => tab.value = Tabs.import;

watch(about, (newValue, oldValue) => {
  if (newValue && !oldValue) getStats();
})
</script>

<template>
  <component class="icon-button" @click="about = true" :is="openButton" v-bind="openButtonProps ?? {}" />

  <q-dialog v-model="about">
    <q-card>
      <q-card-section style="width: 70vw;">
        <div class="text-h6">About</div>
      </q-card-section>

      <q-tabs v-model="tab">
        <q-tab name="about" label="About" />
        <q-tab name="stat" label="Stats" />
        <q-tab name="internals" label="Internals" />
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

      <q-card-section v-if="tab === Tabs.internals || tab === Tabs.import">
        <InternalsDisplay v-if="tab === Tabs.internals" :handle-export-pipelines="handleExportPipelines"
          :handle-import-pipelines="handleImportPipelines" />
        <PipelineImport v-if="tab === Tabs.import" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup="true" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>