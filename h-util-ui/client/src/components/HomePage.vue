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
  <section class="header-bar">
    <span>Visual H-Util</span>
  </section>

  <section class="main-content">
    <nav class="home-options">
      <AboutModal />
      <button class="create-button" @click="handleNewPipeline">
        <PlusBox title="Create a new pipeline" />
        <span>Create pipeline</span>
      </button>
    </nav>


    <q-card class="ui-card">
      <q-card-section>
        <PipelineGallery />
      </q-card-section>
    </q-card>
  </section>


  <section class="task-list-container">
    <TaskList />
  </section>
</template>

<style scoped>
.header-bar {
  height: 40px;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 95vw;
}

.main-content .home-options {
  display: flex;
  height: 40px;
  justify-content: flex-end;
}

.main-content .ui-card {
  flex-grow: 1;
  overflow-y: auto;
}

.task-list-container {
  position: fixed;
  bottom: 1em;
  width: 100vw;
}

.create-button {
  display: flex;
}
</style>