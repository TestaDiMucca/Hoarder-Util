<script setup lang="ts">
import { computed, defineProps, ref } from 'vue';
import Delete from 'vue-material-design-icons/Delete.vue'

import { ProcessingModule, ProcessingModuleType } from '@utils/types';
import { getDefaultModule, getOptionsComponent, MODULE_MATERIAL_ICONS } from '@utils/constants';
import { cloneObject } from '@utils/helpers';
import { getModuleCanInvert } from '@utils/module.helpers';
import DeleteConfirmModal from '../common/DeleteConfirmModal.vue';
import ModuleTypeDropdown from './ModuleTypeDropdown.vue';

interface Props {
  processingModule: ProcessingModule;
  index: number;
  handleModuleUpdated: (newData: ProcessingModule | null, index: number) => void;
}

const props = defineProps<Props>()
const confirmDelete = ref(false);

const handleModuleTypeSelect = (type: ProcessingModuleType) => {
  const newData: ProcessingModule = {
    ...getDefaultModule(),
    type
  }

  props.handleModuleUpdated(newData, props.index);
}

const updateOptionValue = (newValue: string, flag: keyof ProcessingModule['options'] = 'value') => {
  const newData: ProcessingModule = {
    ...props.processingModule,
    options: {
      ...props.processingModule.options,
      [flag]: newValue
    }
  }

  props.handleModuleUpdated(newData, props.index);
}

const handleModuleOptionUpdated = (flag: keyof ProcessingModule['options'], newValue: string) => {
  updateOptionValue(newValue, flag);
}

const handleToggleModuleOption = (option: keyof Omit<ProcessingModule['options'], 'value'>) => {
  const newData: ProcessingModule = cloneObject(props.processingModule);

  newData.options[option] = props.processingModule.options[option] ? false : true;

  props.handleModuleUpdated(newData, props.index);
}

const handleRemoveModule = () => props.handleModuleUpdated(null, props.index)

/** Filter types can be inverted */
const inversionAvailable = computed(() => getModuleCanInvert(props.processingModule.type))
const iconSignifier = computed(() => MODULE_MATERIAL_ICONS[props.processingModule.type])

const optionsComponent = computed(() => getOptionsComponent(props.processingModule.type));
</script>

<template>
  <q-card class="p-2 editor-card">
    <div class="module-header">
      <button class="module-title expand-opts-btn button-with-icon-child">
        <component :is="iconSignifier" />
        <span class="module-name">{{ processingModule.type }} <span class="helper-text">(Click to change)</span></span>
        <ModuleTypeDropdown :handleModuleTypeSelect="handleModuleTypeSelect" />
      </button>

      <span class="module-tools">
        <Delete @click="confirmDelete = true" class="icon-button" :size="18" />
      </span>
    </div>

    <component v-if="!!optionsComponent" :is="optionsComponent" :currentOptions="processingModule.options"
      :moduleType="processingModule.type" :handleOptionChange="handleModuleOptionUpdated" />

    <DeleteConfirmModal v-model="confirmDelete" :onConfirm="handleRemoveModule"
      :deleteTargetName="processingModule.type" />

    <div>
      <q-checkbox v-model="processingModule.options.ignoreErrors" @change="handleToggleModuleOption('ignoreErrors')"
        label="Ignore errors"><q-tooltip :delay="500" :offset="[0, 10]">Continue processing if a particular file
          errors.</q-tooltip></q-checkbox>
      <q-checkbox v-model="(processingModule.options.skipPreviouslyFailed)"
        @change="handleToggleModuleOption('skipPreviouslyFailed')" label="Skip previously failed"><q-tooltip
          :delay="500" :offset="[0, 10]">Next module will ignore files that weren't processed in the
          last.</q-tooltip></q-checkbox>
      <q-checkbox v-if="inversionAvailable" v-model="processingModule.options.inverse"
        @change="handleToggleModuleOption('inverse')" label="Invert logic"><q-tooltip :delay="500"
          :offset="[0, 10]">Invert any logical decisions in this module as a whole.</q-tooltip></q-checkbox>
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
</style>