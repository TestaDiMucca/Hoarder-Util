<template>
  <q-card class="section-card">
    <q-card-section class="headers">
      <slot name="headers"></slot>
    </q-card-section>
    <q-card-section class="content">
      <slot name="content"></slot>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.section-card {
  width: 100%;
  margin-bottom: 5px;
  display: flex;
  gap: var(--spacer-gap);
}

.headers {
  width: 30%;
  border-right: 1px solid gray;
  text-align: right;
}

.content {
  flex-grow: 1;
  text-align: left;
  ;
}
</style>
