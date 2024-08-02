<script setup lang="ts">
import PipelineGallery from './pipelines/PipelineGallery.vue';
import TaskList from './TaskList.vue';
import PlusBox from 'vue-material-design-icons/PlusBox.vue'
import { useQuasar } from 'quasar'
import { ref, watch } from 'vue';
import { loadStats } from '../utils/helpers';
import { StatsStorage } from '../../../common/common.types';

/* Auto dark for now */
useQuasar().dark.set(true);

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
  <h3>Visual H-Util</h3>

  <div>
    <button @click="about = true">
      About
    </button>
  </div>

  <q-dialog v-model="about">
    <q-card>
      <q-card-section>
        <div class="text-h6">About</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        H-util UI:
        {{ JSON.stringify(stats ?? {}) }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup="true" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-card class="ui-card">
    <q-card-section>
      <div>
        Welcome to visual edition
      </div>

      <PipelineGallery />

      <a href="#/new">
        <PlusBox title="Create a new pipeline" /> Create pipeline
      </a>

    </q-card-section>
  </q-card>
  <TaskList />
</template>
