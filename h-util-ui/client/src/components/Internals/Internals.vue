<script setup lang="ts">
import PageLayout from 'src/layout/PageLayout.vue';
import ImportSection from './ImportSection.vue';
import { CardStyles } from '../Pipelines/pipelineGallery.helpers';
import store from '@utils/store';
import InternalsCards from './InternalsCards.vue';

const handleChangeCardStyle = store.setCardStyles;
</script>

<template>
  <PageLayout>
    <template #top-bar>
      <span>Tools & Internals</span>
      <span></span>
    </template>
    <template #content>
      <section class="sections-container">
        <InternalsCards>
          <template #headers>
            Settings
          </template>
          <template #content>
            <q-select class="dropdown" :model-value="store.state.settings.cardStyle"
              :options="Object.values(CardStyles)" @update:model-value="handleChangeCardStyle" label="Card style"
              :hide-dropdown-icon="true" />
          </template>
        </InternalsCards>
        <InternalsCards>
          <template #headers>
            Import / Export
          </template>
          <template #content>
            <ImportSection />
          </template>
        </InternalsCards>
      </section>
    </template>
  </PageLayout>
</template>

<style scoped>
.sections-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
