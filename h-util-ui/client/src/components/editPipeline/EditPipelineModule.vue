<script setup lang="ts">
import { computed, defineProps, ref } from 'vue';
import Delete from 'vue-material-design-icons/Delete.vue'
import Help from 'vue-material-design-icons/HelpCircle.vue'

import { ActionModule, ProcessingModuleType } from '@utils/types';
import { getDefaultModule, getOptionsComponent, MODULE_MATERIAL_ICONS, OPTION_TOOLTIP } from '@utils/constants';
import { cloneObject } from '@utils/helpers';
import { getModuleCanInvert } from '@utils/module.helpers';
import DeleteConfirmModal from '../common/DeleteConfirmModal.vue';
import ModuleTypeDropdown from './ModuleTypeDropdown.vue';
import { ProcessingModuleBooleanOptions } from '@shared/common.types';

interface Props {
  processingModule: ActionModule;
  index: number;
  handleModuleUpdated: (newData: ActionModule | null, index: number) => void;
}

const props = defineProps<Props>()
const confirmDelete = ref(false);

const handleModuleTypeSelect = (type: ProcessingModuleType) => {
  if (type === ProcessingModuleType.branch) return;

  const newData: ActionModule = {
    ...getDefaultModule(),
    type
  }

  props.handleModuleUpdated(newData, props.index);
}

const updateOptionValue = <T = string>(newValue: T, flag: keyof ActionModule['options'] = 'value') => {
  const newData: ActionModule = {
    ...props.processingModule,
    options: {
      ...props.processingModule.options,
      [flag]: newValue
    }
  }

  props.handleModuleUpdated(newData, props.index);
}

const handleModuleOptionUpdated = <T = string>(flag: keyof ActionModule['options'], newValue: T) => {
  updateOptionValue(newValue, flag);
}

const handleToggleModuleOption = (option: keyof ProcessingModuleBooleanOptions) => {
  const newData: ActionModule = cloneObject(props.processingModule);

  newData.options[option] = props.processingModule.options[option] ? false : true;

  props.handleModuleUpdated(newData, props.index);
}

const handleRemoveModule = () => props.handleModuleUpdated(null, props.index)

/** Filter types can be inverted */
const inversionAvailable = computed(() => getModuleCanInvert(props.processingModule.type))
const iconSignifier = computed(() => MODULE_MATERIAL_ICONS[props.processingModule.type])

const optionsComponent = computed(() => getOptionsComponent(props.processingModule.type));
const optionTooltip = computed(() => OPTION_TOOLTIP[props.processingModule.type]);
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

    <div v-if="!!optionsComponent"><span class="options-header">Options</span>
      <Help v-if="!!optionTooltip" :size="12" />
      <q-tooltip :delay="500" :offset="[0, 10]">{{ optionTooltip }}</q-tooltip>
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

.options-header {
  font-weight: 600;
  margin-right: 5px;
}
</style>