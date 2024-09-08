<script setup lang="ts">
import PipelineGallery from './Pipelines/PipelineGallery.vue';
import TaskList from './TaskList/TaskList.vue';
import PlusBox from 'vue-material-design-icons/PlusBox.vue'
import Information from 'vue-material-design-icons/Information.vue'
import { useQuasar } from 'quasar'
import AboutModal from './About/AboutModal.vue';
import { navigateTo, PageViews } from '@utils/helpers';

/* Auto dark for now */
useQuasar().dark.set(true);

const handleNewPipeline = () => navigateTo(PageViews.Edit);
</script>

<template>
  <section class="header-bar">
    <span>Visual H-Util</span>
    <nav class="controls">
      <AboutModal :open-button="Information" />
      <PlusBox class="icon-button create-button" @click="handleNewPipeline" title="Create a new pipeline" />
    </nav>
  </section>

  <section class="main-content">
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
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.header-bar .controls {
  display: flex;
  gap: 0.5em;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.main-content .ui-card {
  flex-grow: 1;
  overflow-y: auto;
}

.task-list-container {
  position: fixed;
  bottom: 0;
  width: calc(100% - 4rem);
}

.create-button {
  display: flex;
  color: var(--q-lightColor);
}
</style>