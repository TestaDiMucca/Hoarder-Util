<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import HomePage from './components/HomePage.vue'
import NewPipeline from './components/createNewPipeline/NewPipeline.vue'
import { VueComponent } from './utils/util.types'
import { getIpcRenderer, sendMessageToMain } from './utils/helpers'

const $q = useQuasar();

const routes: Record<string, VueComponent> = {
  '/': HomePage,
  '/new': NewPipeline
}
const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
});

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] ?? HomePage
})

const electronApi = ref(!!(window as any).electronIpc)

onMounted(() => {
  sendMessageToMain('App mounted');

  const ipcRenderer = getIpcRenderer();

  /** Subscribe to main's messages */
  ipcRenderer?.onMainMessage((payload: string) => {
    const message = payload;

    $q.notify(message ?? 'No message')
  })
})
</script>

<template>
  <component :is="currentView" />
  <span>API ipc: {{ electronApi }}</span>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
