<script setup lang="ts">
import MenuRight from 'vue-material-design-icons/MenuRight.vue';

export type MenuItem = {
  type: 'group'
  items: MenuItem[];
  label: string;
} | {
  type: 'item'
  onClick: () => void;
  label: string;
} | {
  type: 'separator'
}

interface Props {
  menuItems: MenuItem[];
  subMenu?: boolean;
}

defineProps<Props>();
</script>

<template>
  <q-menu class="dropdown-menu" :anchor="subMenu ? 'top end' : undefined" :self="subMenu ? 'top start' : undefined">
    <div v-for="menuItem in menuItems">
      <q-item v-if="menuItem.type === 'item'" @click="menuItem.onClick" clickable v-close-popup>
        <q-item-section>{{ menuItem.label }}</q-item-section>
      </q-item>

      <q-separator v-if="menuItem.type === 'separator'" />

      <q-item clickable v-if="menuItem.type === 'group'">
        <q-item-section>{{ menuItem.label }}</q-item-section>
        <q-item-section side>
          <MenuRight :size="20" />
        </q-item-section>
        <DropdownMenu :menuItems="menuItem.items" :subMenu="true" />
      </q-item>
    </div>
  </q-menu>
</template>

<style scoped>
.dropdown-menu {
  min-width: 100px;
}
</style>
