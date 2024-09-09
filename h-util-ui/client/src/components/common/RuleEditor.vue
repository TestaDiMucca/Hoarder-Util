<template>
  <div class="rule-editor">
    <div v-if="currentRule.type !== 'basic'">
      <label>Group Type:</label>
      <select v-model="currentRule.type">
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>

      <div v-for="(rule, index) in currentRule.rules" :key="index" class="rule-item">
        <rule-editor :rule="rule" @update-rule="updateSubRule(index, $event)" />
        <button @click="removeRule(index)">Remove Rule</button>
      </div>

      <button @click="addNewRule">Add Rule</button>
      <button @click="addNewGroup">Add Group</button>
    </div>

    <div v-else>
      <label>Attribute:</label>
      <input v-model="currentRule.attribute" placeholder="Enter attribute" />

      <label>Operator:</label>
      <select v-model="currentRule.operator">
        <option value="=">=</option>
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value=">=">&gt;=</option>
        <option value="<=">&lt;=</option>
        <option value="!=">!=</option>
        <option value="contains">contains</option>
      </select>

      <label>Value:</label>
      <input v-model="currentRule.value" placeholder="Enter value" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Rule, LogicalGroup, Operator, AttributeType, RuleSet } from '@shared/rules.types';

type Props = {
  rule: Rule;
}

const props = defineProps<Props>();

const currentRule = ref(props.rule);

const isGroup = ref(currentRule.value.type !== 'basic');

const emit = defineEmits(['update-rule'])

const updateSubRule = (index: number, updatedRule: Rule) => {
  if (isGroup.value) {
    (currentRule.value as LogicalGroup).rules[index] = updatedRule;
    emit('update-rule', currentRule.value);
  }
};

const addNewRule = () => {
  if (isGroup.value) {
    (currentRule.value as LogicalGroup).rules.push({
      attribute: '',
      attributeType: AttributeType.number,
      operator: Operator.eq,
      value: '',
      type: 'basic',
    });
    emit('update-rule', currentRule.value);
  }
};

const addNewGroup = () => {
  if (isGroup.value) {
    (currentRule.value as LogicalGroup).rules.push({
      type: 'AND',
      rules: []
    });
    emit('update-rule', currentRule.value);
  }
};

const removeRule = (index: number) => {
  if (isGroup.value) {
    (currentRule.value as LogicalGroup).rules.splice(index, 1);
    emit('update-rule', currentRule.value);
  }
};
</script>

<style scoped>
.rule-editor {
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.rule-item {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}
</style>