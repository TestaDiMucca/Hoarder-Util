<script setup lang="ts">
import { computed } from 'vue';
import { PipelineOptionsProps } from './pipelineOptions.common';
import RuleEditor from 'src/components/common/RuleEditor.vue';
import { getDefaultRule } from '@shared/rules.utils';
import { Rule } from '@shared/rules.types';
import { ProcessingModuleType } from '@shared/common.types';
import FilterTester from './FilterTester.vue';

const props = defineProps<PipelineOptionsProps>();

const handleModuleOptionUpdated = (newRules: Rule) => {
  props.handleOptionChange('rules', newRules);
}

/** Populate defaults if necessary */
const currentRules = computed(() => props.currentOptions.rules ?? getDefaultRule())
</script>

<template>
  <section class="filter-options">
    <RuleEditor @update-rule="handleModuleOptionUpdated" :rule="currentRules" />

    <FilterTester :type="ProcessingModuleType.ruleFilter" :options="currentOptions" />
  </section>
</template>
