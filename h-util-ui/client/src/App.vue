<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import Pipelines from './components/Pipelines/Pipelines.vue'
import EditPipeline from './components/EditPipeline/EditPipeline.vue'
import { VueComponent } from './utils/util.types'
import { addErrorListeners, getIpcRenderer, loadUserData, sendMessageToMain } from './utils/helpers'
import store from './utils/store'
import { PageViews } from '@utils/types'
import DrawerNav from './components/Nav/DrawerNav.vue'
import Internals from './components/Internals/Internals.vue'
import Directories from './components/Directories/Directories.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
import { initializeSQLite } from './data/sqlite'

const $q = useQuasar();

/* Auto dark for now */
$q.dark.set(true);

const routes: Record<PageViews, VueComponent> = {
  [PageViews.Home]: Pipelines,
  [PageViews.Edit]: EditPipeline,
  [PageViews.Directories]: Directories,
  [PageViews.Internals]: Internals
}
const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
});

const pathName = computed(() => currentPath.value.slice(1) || '/');

const currentView = computed<VueComponent>(() => {
  return routes[pathName.value] ?? Pipelines
})

/** App setup */
onMounted(() => {
  sendMessageToMain('App mounted');

  /** Subscribe to main's messages */
  getIpcRenderer().onMainMessage((payload: string) => {
    const message = payload;

    $q.notify(message ?? 'No message')
  })

  initializeSQLite();

  loadUserData().then(data => {
    if (!data) return;

    store.setAllPipelines(data.pipelines);
  })

  addErrorListeners();
})
</script>

<template>
  <q-layout class="app-container" view="hHh Lpr lff" container>
    <DrawerNav :path-name="pathName" />
    <q-page-container>
      <ErrorBoundary>
        <component :is="currentView" />
      </ErrorBoundary>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
}

.task-list-container {
  position: fixed;
  bottom: 0;
  width: calc(100% - 4rem);
}
</style>
