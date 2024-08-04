<script setup lang="ts">
import PipelineGallery from './pipelines/PipelineGallery.vue';
import TaskList from './TaskList.vue';
import PlusBox from 'vue-material-design-icons/PlusBox.vue'
import { useQuasar } from 'quasar'
import AboutModal from './about/AboutModal.vue';

/* Auto dark for now */
useQuasar().dark.set(true);

const handleNewPipeline = () => window.location.href = '#/new';
</script>

<template>
  <h3>Visual H-Util</h3>

  <AboutModal />
  <button @click="handleNewPipeline">
    <PlusBox title="Create a new pipeline" /> Create pipeline
  </button>

  <q-card class="ui-card">
    <q-card-section>
      <PipelineGallery />
    </q-card-section>
  </q-card>
  <TaskList />
</template>
