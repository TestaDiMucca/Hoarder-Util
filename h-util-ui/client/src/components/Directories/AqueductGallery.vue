<script setup lang="ts">
import PlusBox from 'vue-material-design-icons/PlusBox.vue'

import { Aqueduct } from '@shared/common.types';
import PageLayout from 'src/layout/PageLayout.vue';

type Props = {
  aqueducts: Aqueduct[] | null;
  handleNew: () => void;
}

defineProps<Props>();
</script>

<template>
  <PageLayout>
    <template #top-bar>
      <span>Directory pipelines</span>
      <PlusBox class="icon-button create-button" @click="handleNew" title="Create a new pipeline" />
    </template>
    <template #content>
      <section class="aqueduct-gallery">
        <div v-for="aqueduct in aqueducts">
          {{ aqueduct.name }}
        </div>
        <div v-if="!aqueducts">
          No aqueducts. Aqueducts enable connecting directories to pipelines.
        </div>
      </section>
    </template>
  </PageLayout>
</template>
