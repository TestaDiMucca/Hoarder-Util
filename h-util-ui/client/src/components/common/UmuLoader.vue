<template>
  <img src="/umu.gif" class="loader" alt="Loading..." />
</template>

<style scoped>
.loader {
  animation: rotation 8s infinite linear;
  filter: sepia(1);
  height: 75px;
  width: 75px;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(359deg);
  }
}
</style>