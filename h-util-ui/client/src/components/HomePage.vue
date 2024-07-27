<script setup lang="ts">
import PipelineGallery from './pipelines/PipelineGallery.vue';
import TaskList from './TaskList.vue';
import PlusBox from 'vue-material-design-icons/PlusBox.vue'
import { useQuasar } from 'quasar'

/* Auto dark for now */
useQuasar().dark.set(true);
</script>

<template>
  <h3>Visual H-Util</h3>

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
