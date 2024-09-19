<script setup lang="ts">
import { ProcessingBranch, ProcessingModule } from '@shared/common.types';
import { Rule } from '@shared/rules.types';
import RuleEditor from 'src/components/common/RuleEditor.vue';
import { computed, inject, Ref } from 'vue';

type Props = {
  moduleId: string;
  branch: ProcessingBranch;
  index: number;
  handleBranchChange: (branch: ProcessingBranch | null, index: number) => void;
};

const props = defineProps<Props>();

const pipelineModules = inject<Ref<ProcessingModule[]>>('pipelineModules');

const handleLabelChange = (label: string | number | null) => {
  const newBranch = {
    ...props.branch,
    label: label ? String(label) : undefined
  }

  props.handleBranchChange(newBranch, props.index);
}

const handleRuleUpdates = (rules: Rule) => {
  const newBranch = {
    ...props.branch,
    rules
  }

  props.handleBranchChange(newBranch, props.index);
}

const handleModuleUpdate = (opt) => {
  const newBranch = {
    ...props.branch,
    targetModule: opt.value
  }

  props.handleBranchChange(newBranch, props.index);
}

// todo: "new module", and "none", and optimize
const moduleOptions = (pipelineModules?.value ?? []).filter(m => m.id !== props.moduleId).map(m => ({
  label: m.type,
  value: m.id
}))

const currentSelectedModule = computed(() => moduleOptions.find(o => o.value === props.branch.targetModule))

</script>

<template>
  <q-input type="text" :model-value="branch.label" @update:modelValue="handleLabelChange" label="Branch label"
    :placeholder="`branch ${index}`" />

  <RuleEditor :rule="branch.rules" :onUpdatedRule="handleRuleUpdates" />

  <q-select v-if="moduleOptions.length > 0" :model-value="currentSelectedModule" :options="moduleOptions"
    @update:model-value="handleModuleUpdate" :hide-dropdown-icon="true" label="To existing module" />
</template>
