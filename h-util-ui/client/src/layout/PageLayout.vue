<template>
  <div class="header-and-content">
    <section class="top-bar">
      <slot name="top-bar"></slot>
    </section>
    <section class="content">
      <slot name="content"></slot>
    </section>
    <section class="footer">
      <slot name="footer"></slot>
    </section>
  </div>
</template>

<style scoped>
.header-and-content {
  display: flex;
  flex-direction: column;
  max-height: 100vh;
}

.top-bar {
  background-color: var(--q-backingColor);
  border-bottom: 1px solid var(--q-lightColor);
  color: white;
  /* color: var(--q-lightColor); */
  height: 3.5rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
}

.content {
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.footer {
  padding-top: 5px;
  height: 3.5rem;
  width: 100%;
}
</style>
