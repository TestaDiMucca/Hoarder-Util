<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Aqueduct } from '@shared/common.types';
import { getDefaultAqueduct } from '@utils/models.helpers';
import store from '@utils/store';
import EditAqueduct from '../EditAqueduct/EditAqueduct.vue';
import AqueductGallery from './AqueductGallery.vue';
import { models } from 'src/data/models';

const stateStore = ref(store.state);
const selectedAqueduct = ref<Aqueduct | null>(null);

const fetchAqueducts = async () => {
  const data = models.aqueducts.selectAll();

  if (data) store.setAqueducts(data);
}

onMounted(async () => {
  /* Perform first fetch */
  if (stateStore.value.aqueducts === null) fetchAqueducts();
})

const handleNew = () => {
  selectedAqueduct.value = getDefaultAqueduct();
}

const handleEdit = (aqueduct: Aqueduct) => {
  selectedAqueduct.value = aqueduct;
}

const clearSelection = () => {
  selectedAqueduct.value = null;
}
</script>

<template>
  <EditAqueduct v-if="selectedAqueduct" :aqueduct="selectedAqueduct" :return-home="clearSelection"
    @update="fetchAqueducts" />
  <AqueductGallery v-else :aqueducts="stateStore.aqueducts" :handle-new="handleNew" :handleEdit="handleEdit"
    @update="fetchAqueducts" />
</template>

<style scoped></style>
