<script setup lang="ts">
import PipelineGallery from './Pipelines/PipelineGallery.vue';
import TaskList from './TaskList/TaskList.vue';
import PlusBox from 'vue-material-design-icons/PlusBox.vue'
import Information from 'vue-material-design-icons/Information.vue'
import { useQuasar } from 'quasar'
import AboutModal from './About/AboutModal.vue';
import { navigateTo, PageViews } from '@utils/helpers';
import PageLayout from 'src/layout/PageLayout.vue';

/* Auto dark for now */
useQuasar().dark.set(true);

const handleNewPipeline = () => navigateTo(PageViews.Edit);
</script>

<template>
  <PageLayout>
    <template #top-bar>
      <span>Visual H-Util</span>
      <nav class="controls">
        <AboutModal :open-button="Information" />
        <PlusBox class="icon-button create-button" @click="handleNewPipeline" title="Create a new pipeline" />
      </nav>
    </template>
    <template #content>
      <PipelineGallery />
    </template>
  </PageLayout>

  <section class="task-list-container">
    <TaskList />
  </section>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 0.5em;
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