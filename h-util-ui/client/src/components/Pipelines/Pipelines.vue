<script setup lang="ts">
import PipelineGallery from './PipelineGallery.vue';
import PlusBox from 'vue-material-design-icons/PlusBox.vue'
import Information from 'vue-material-design-icons/Information.vue'
import AboutModal from '../About/AboutModal.vue';
import { navigateTo, PageViews } from '@utils/helpers';
import PageLayout from 'src/layout/PageLayout.vue';

const handleNewPipeline = () => navigateTo(PageViews.Edit);
</script>

<template>
  <PageLayout>
    <template #top-bar>
      <span class="select-none">Pipeline gallery</span>
      <nav class="controls">
        <AboutModal :open-button="Information" />
        <PlusBox class="icon-button create-button" @click="handleNewPipeline" title="Create a new pipeline" />
      </nav>
    </template>
    <template #content>
      <PipelineGallery />
    </template>
  </PageLayout>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 0.5em;
}
</style>