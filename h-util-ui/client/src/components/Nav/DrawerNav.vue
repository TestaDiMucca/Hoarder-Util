<script setup lang="ts">
import { computed, ref } from 'vue';
import FileCompare from 'vue-material-design-icons/FileCompare.vue'
import PipeValve from 'vue-material-design-icons/PipeValve.vue'
import Waves from 'vue-material-design-icons/Waves.vue';
import WrenchCog from 'vue-material-design-icons/WrenchCog.vue'
import { PageViews } from '@utils/types';
import { navigateTo } from '@utils/helpers';

const props = defineProps<{
  pathName: string;
}>();

const drawer = ref(false);
const miniState = ref(true);

const handleNavigate = (path: PageViews) => {
  /** Disallow leaving edit mode without saving for now */
  if (props.pathName === PageViews.Edit) return;

  navigateTo(path);
}

const menuDisabled = computed(() => props.pathName === PageViews.Edit);

</script>

<template>
  <q-drawer v-model="drawer" show-if-above :mini="miniState" @mouseenter="miniState = false"
    @mouseleave="miniState = true" mini-to-overlay :width="200" :breakpoint="500" bordered>
    <q-scroll-area class="fit" :horizontal-thumb-style="{ opacity: '0' }">
      <q-list padding>
        <q-item>
          <q-item-section avatar>
            <FileCompare />
          </q-item-section>

          <q-item-section class="main-title">
            Visual H-Util
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item :disable="menuDisabled" :active="pathName === PageViews.Home || pathName === PageViews.Edit"
          @click="handleNavigate(PageViews.Home)" clickable v-ripple>
          <q-item-section avatar>
            <PipeValve />
          </q-item-section>

          <q-item-section>
            Pipelines
          </q-item-section>
        </q-item>

        <q-item :disable="menuDisabled" :active="pathName === PageViews.Directories"
          @click="handleNavigate(PageViews.Directories)" clickable v-ripple>
          <q-item-section avatar>
            <Waves />
          </q-item-section>

          <q-item-section>
            Directories
          </q-item-section>
        </q-item>

        <q-item :disable="menuDisabled" :active="pathName === PageViews.Internals"
          @click="handleNavigate(PageViews.Internals)" clickable v-ripple>
          <q-item-section avatar>
            <WrenchCog />
          </q-item-section>

          <q-item-section>
            Tools & Internals
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<style scoped>
.main-title {
  font-weight: 600;
  user-select: none;
}
</style>