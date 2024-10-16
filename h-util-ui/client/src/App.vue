<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import Pipelines from './components/Pipelines/Pipelines.vue'
import EditPipeline from './components/EditPipeline/EditPipeline.vue'
import { VueComponent } from './utils/util.types'
import { addErrorListeners, getIpcRenderer, sendMessageToMain } from './utils/helpers'
import store from './utils/store'
import { PageViews } from '@utils/types'
import DrawerNav from './components/Nav/DrawerNav.vue'
import Internals from './components/Internals/Internals.vue'
import Directories from './components/Directories/Directories.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
import { initializeSQLite } from './data/sqlite'
import { models } from './data/models'
import { RendererMessage, UpdateStatPayload } from '@shared/common.types'
import { IpcMessageType } from '@shared/common.constants'

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
/** Wait for database and any connections to be ready. Should be fast. */
const loading = ref(true);

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

  const ipcRenderer = getIpcRenderer();

  ipcRenderer.onRendererMessage((rawPayload: string) => {
    const payload = JSON.parse(rawPayload) as RendererMessage;

    switch (payload.type) {
      case 'message':
        $q.notify(payload.message ?? 'No message')
        break;
      default:
    }

    ipcRenderer.invoke<RendererMessage>(IpcMessageType.rendererMessage, {
      type: 'confirm',
      messageId: payload.messageId
    })
  })

  ipcRenderer.onStatUpdate(({ pipelineUuid, stats }: UpdateStatPayload) =>
    stats.forEach(({ stat, amount }) => models.stats.addRunStat(pipelineUuid, stat, amount))
  );

  initializeSQLite().then(() => {
    loading.value = false;
    store.syncPipelineDataFromStorage();
  });

  addErrorListeners();
})
</script>

<template>
  <q-layout class="app-container" view="hHh Lpr lff" container>
    <DrawerNav :path-name="pathName" />
    <q-page-container>
      <ErrorBoundary>
        <component v-if="!loading" :is="currentView" />
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
