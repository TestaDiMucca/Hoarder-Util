<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import HomePage from './components/HomePage.vue'
import EditPipeline from './components/EditPipeline/EditPipeline.vue'
import { VueComponent } from './utils/util.types'
import { addErrorListeners, getIpcRenderer, loadUserData, sendMessageToMain } from './utils/helpers'
import store from './utils/store'
import { PageViews } from '@utils/types'
import DrawerNav from './components/Nav/DrawerNav.vue'

const $q = useQuasar();

const routes: Record<PageViews, VueComponent> = {
  [PageViews.Home]: HomePage,
  [PageViews.Edit]: EditPipeline
}
const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
});

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] ?? HomePage
})

/** App setup */
onMounted(() => {
  sendMessageToMain('App mounted');

  const ipcRenderer = getIpcRenderer();

  /** Subscribe to main's messages */
  ipcRenderer?.onMainMessage((payload: string) => {
    const message = payload;

    $q.notify(message ?? 'No message')
  })

  loadUserData().then(data => {
    if (!data) return;

    store.setAllPipelines(data.pipelines);
  })

  addErrorListeners();
})
</script>

<template>
  <q-layout class="app-container" view="hHh Lpr lff" container>
    <DrawerNav />
    <q-page-container>
      <component :is="currentView" />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  /* height: 90vh; */
}
</style>
