<script setup lang="ts">
import { computed, defineProps, ref } from 'vue';
import MenuRight from 'vue-material-design-icons/MenuRight.vue';
import Delete from 'vue-material-design-icons/Delete.vue'

import { ProcessingModule, ProcessingModuleType } from '@utils/types';
import { MODULE_MATERIAL_ICONS, OPTION_LABELS } from '@utils/constants';
import { cloneObject, getIpcRenderer } from '@utils/helpers';
import { getModuleCanInvert, getModuleOptionType } from '@utils/module.helpers';
import DeleteConfirmModal from '../common/DeleteConfirmModal.vue';
import { ModuleOptionType } from '@shared/common.types';

interface Props {
  processingModule: ProcessingModule;
  index: number;
  handleModuleUpdated: (newData: ProcessingModule | null, index: number) => void;
}

const props = defineProps<Props>()
const confirmDelete = ref(false);

const handleModuleTypeSelect = (type: ProcessingModuleType) => {
  const newData: ProcessingModule = {
    ...props.processingModule,
    type
  }

  props.handleModuleUpdated(newData, props.index);
}

const updateOptionValue = (newValue: string) => {
  const newData: ProcessingModule = {
    ...props.processingModule,
    options: {
      value: newValue
    }
  }

  props.handleModuleUpdated(newData, props.index);
}

const handleModuleOptionUpdated = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value;

  updateOptionValue(newValue);
}

const handleToggleModuleOption = (option: keyof Omit<ProcessingModule['options'], 'value'>) => {
  const newData: ProcessingModule = cloneObject(props.processingModule);

  newData.options[option] = props.processingModule.options[option] ? false : true;

  props.handleModuleUpdated(newData, props.index);
}

const handleRemoveModule = () => props.handleModuleUpdated(null, props.index)

const handleDirPrompt = async () => {
  const ipcRenderer = getIpcRenderer();

  if (!ipcRenderer) return;

  const folder = await ipcRenderer.selectFolder();
  updateOptionValue(folder)
}

const directoryDisplay = computed(() => String(props.processingModule.options.value ?? '').length ? props.processingModule.options.value : 'Select a directory')

/** Filter types can be inverted */
const inversionAvailable = computed(() => getModuleCanInvert(props.processingModule.type))
const iconSignifier = computed(() => MODULE_MATERIAL_ICONS[props.processingModule.type])
const optionLabel = computed(() => OPTION_LABELS[props.processingModule.type])
const optionType = computed(() => getModuleOptionType(props.processingModule.type))
</script>

<template>
  <q-card class="p-2 editor-card">
    <div class="module-header">
      <button class="module-title expand-opts-btn button-with-icon-child">
        <component :is="iconSignifier" />
        <span class="module-name">{{ processingModule.type }} <span class="helper-text">(Click to change)</span></span>
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.subfolder)" clickable v-close-popup="true">
              <q-item-section>Place in directory</q-item-section>
            </q-item>

            <q-separator />
            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.metadata)" clickable v-close-popup="true">
              <q-item-section>Metadata tag</q-item-section>
            </q-item>
            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.datePrefix)" clickable v-close-popup="true">
              <q-item-section>Date prefix</q-item-section>
            </q-item>
            <q-separator />

            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.iterate)" clickable v-close-popup="true">
              <q-item-section>Iterate</q-item-section>
            </q-item>
            <q-item @click="handleModuleTypeSelect(ProcessingModuleType.report)" clickable v-close-popup="true">
              <q-item-section>Log results</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable>
              <q-item-section>Media compression</q-item-section>
              <q-item-section side>
                <MenuRight :size="20" />
              </q-item-section>
              <q-menu anchor="top end" self="top start">
                <q-list>
                  <q-item @click="handleModuleTypeSelect(ProcessingModuleType.compressImage)" clickable
                    v-close-popup="true">
                    <q-item-section>Compress image</q-item-section>
                  </q-item>
                  <q-item @click="handleModuleTypeSelect(ProcessingModuleType.compressVideo)" clickable
                    v-close-popup="true">
                    <q-item-section>Compress video</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
            <q-item clickable>
              <q-item-section>Filtering</q-item-section>
              <q-item-section side>
                <MenuRight :size="20" />
              </q-item-section>

              <q-menu anchor="top end" self="top start">
                <q-list>
                  <q-item @click="handleModuleTypeSelect(ProcessingModuleType.filter)" clickable v-close-popup="true">
                    <q-item-section>Filter file</q-item-section>
                  </q-item>
                  <q-item @click="handleModuleTypeSelect(ProcessingModuleType.ocr)" clickable v-close-popup="true">
                    <q-item-section>Search image for text</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </q-list>
        </q-menu>
      </button>

      <span class="module-tools">
        <Delete @click="confirmDelete = true" class="icon-button" :size="18" />
      </span>
    </div>

    <DeleteConfirmModal v-model="confirmDelete" :onConfirm="handleRemoveModule"
      :deleteTargetName="processingModule.type" />

    <q-input v-if="optionLabel && optionType === ModuleOptionType.string" type="text"
      v-model="processingModule.options.value" @input="handleModuleOptionUpdated" :label="optionLabel ?? ''" />

    <div class="select-directory" v-if="optionType === ModuleOptionType.dir" @click="handleDirPrompt">{{
      directoryDisplay }}</div>

    <div>
      <q-checkbox v-model="processingModule.options.ignoreErrors" @change="handleToggleModuleOption('ignoreErrors')"
        label="Ignore errors" />
      <q-checkbox v-model="(processingModule.options.skipPreviouslyFailed)"
        @change="handleToggleModuleOption('skipPreviouslyFailed')" label="Skip previously failed" />
      <q-checkbox v-if="inversionAvailable" v-model="processingModule.options.inverse"
        @change="handleToggleModuleOption('inverse')" label="Invert logic" />
    </div>
  </q-card>
</template>

<style scoped>
.editor-card {
  padding: 1em
}

.module-name {
  font-weight: 700;
}

.module-header {
  display: flex;
  justify-content: space-between;
}

.module-title {
  display: flex;
  justify-content: center;
  gap: 0.2em;
  align-items: start;
  padding-left: 0;
}

.select-directory {
  cursor: pointer;
}
</style>