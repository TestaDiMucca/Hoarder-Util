<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Rule, Operator } from '@shared/rules.types';
import { availableOperatorsForAttrType, getDefaultGroupRule, getDefaultRule } from '@shared/rules.utils';
import DropdownMenu, { MenuItem } from './DropdownMenu.vue';
import Delete from 'vue-material-design-icons/Delete.vue'
import { ExtraData, RenameTemplates } from '@shared/common.constants';

type Props = {
  rule: Rule;
  /** Should not pass in, just used recursively for styling/max purposes */
  nested?: number;
  onUpdatedRule?: (rules: Rule) => void;
}

const MAX_NESTING = 2;
const props = defineProps<Props>();

const currentRule = ref(props.rule);
const isGroup = computed(() => currentRule.value.type !== 'basic');
const attributeOptions = computed(() => [...Object.values(RenameTemplates), ...Object.values(ExtraData)])

const emit = defineEmits(['update-rule'])
const nestLevel = (props.nested ?? 0);

watch(currentRule, () => {
  if (nestLevel > 0) return;

  props.onUpdatedRule?.(currentRule.value)
  emit('update-rule', currentRule.value)
}, { deep: true })

const updateSubRule = (index: number, updatedRule: Rule) => {
  /** this works better than isGroup with typing */
  if (currentRule.value.type !== 'basic') {
    currentRule.value.rules[index] = updatedRule;
  }
};

const addNewRule = () => {
  if (currentRule.value.type === 'basic') return;

  currentRule.value.rules.push(getDefaultRule());
};

const addNewGroup = () => {
  if (currentRule.value.type === 'basic') return;

  currentRule.value.rules.push({
    type: 'AND',
    rules: [getDefaultRule()]
  });
};

const removeRule = (index: number) => {
  if (currentRule.value.type === 'basic') return;

  currentRule.value.rules.splice(index, 1);

  if (currentRule.value.rules.length === 0) {
    /** Revert to basic */
    currentRule.value = getDefaultRule();
  }
};

const toggleRuleType = () => {
  if (isGroup.value) {
    currentRule.value = getDefaultRule();
  } else {
    currentRule.value = getDefaultGroupRule(currentRule.value.type === 'basic' ? currentRule.value : undefined);
  }
}

const changeOperator = (operator: Operator) => {
  if (currentRule.value.type !== 'basic') return;

  currentRule.value.operator = operator;
}

const availableOperators = computed<MenuItem[]>(() => (currentRule.value.type === 'basic' ? availableOperatorsForAttrType(currentRule.value.attributeType) : []).map(operator => ({
  type: 'item',
  onClick: () => changeOperator(operator),
  label: operator
})))
</script>

<template>
  <div class="rule-editor">
    <div v-if="currentRule.type !== 'basic'" class="sub-component">
      <div class="group-type">
        <label>Group Type:</label>
        <select v-model="currentRule.type">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>

      <div v-for="(rule, index) in currentRule.rules" :key="index" class="rule-item">
        <RuleEditor :rule="rule" @update-rule="updateSubRule(index, $event)" :nested="nestLevel + 1" />
        <Delete @click="removeRule(index)" class="remove-btn icon-button" :size="18" />
      </div>

      <button @click="addNewRule">Add Rule</button>
      <button v-if="nestLevel < MAX_NESTING" @click="addNewGroup">Add Group</button>
    </div>

    <div v-else :class="{ 'rule-row': true, 'sub-component': nestLevel > 0 }">
      <div class="single-rule">
        <q-select class="dropdown" v-model="currentRule.attribute" label="Attribute" :hide-dropdown-icon="true"
          :options="attributeOptions" />

        <button class="operator-button">
          {{ currentRule.operator }}
          <DropdownMenu :menuItems="availableOperators" />
        </button>

        <q-input type="text" v-model="currentRule.value" placeholder="Enter value" label="Value" />
      </div>

      <button v-if="nestLevel === 0" @click="toggleRuleType">
        Add rule
      </button>
    </div>
  </div>
</template>

<style scoped>
.rule-editor {
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.single-rule {
  display: flex;
  width: 100%;
  gap: 1em;
  align-items: center;
}

.single-rule .q-field {
  flex-grow: 1;
  min-width: 25%;
}

.operator-button {
  padding: 0.3em;
  width: 4.5em;
  height: 50%;
}

.rule-item {
  margin-bottom: 10px;
  display: flex;
  width: 100%;
  align-items: center;
}

.rule-item .rule-editor {
  flex-grow: 1;
}

.remove-btn {
  width: 2em;
}

.group-type {
  display: flex;
  gap: 5px;
  align-items: baseline;
  justify-content: center;
}

label {
  display: block;
  margin-bottom: 5px;
}
</style>