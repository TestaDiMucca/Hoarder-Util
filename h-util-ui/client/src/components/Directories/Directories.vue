<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IpcMessageType } from '@shared/common.constants';
import { Aqueduct, AqueductLoadResponse, AqueductMessage } from '@shared/common.types';
import { getIpcRenderer } from '@utils/helpers';
import { getDefaultAqueduct } from '@utils/models.helpers';
import store from '@utils/store';
import EditAqueduct from '../EditAqueduct/EditAqueduct.vue';
import AqueductGallery from './AqueductGallery.vue';

const stateStore = ref(store.state);
const selectedAqueduct = ref<Aqueduct | null>(null);

const fetchAqueducts = async () => {
  const data = await getIpcRenderer()?.invoke<AqueductMessage, AqueductLoadResponse>(IpcMessageType.aqueducts, { type: 'load' });

  if (data) store.setAqueducts(data.data);
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
    :onNewAdded="fetchAqueducts" />
  <AqueductGallery v-else :aqueducts="stateStore.aqueducts" :handle-new="handleNew" :handleEdit="handleEdit"
    :onAqueductsChange="fetchAqueducts" />
</template>

<style scoped></style>
