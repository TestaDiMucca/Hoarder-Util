<template>
  <div>
    Current pipelines: {{ Object.keys(state.pipelines).length }}
  </div>
</template>

<script lang="ts">
  import store from '../../utils/store';

  export default {
    setup() {
      return {
        state: store.state,
      };
    }
  };
</script>
