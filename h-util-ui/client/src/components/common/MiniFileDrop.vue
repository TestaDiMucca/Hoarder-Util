<script setup lang="ts">
import { FileUploadOptions, useDropzone } from "vue3-dropzone";

interface Props {
  handleDroppedFiles: (fileList: string[]) => void;
}

interface ElectronFile extends File {
  path: string;
}

const props = defineProps<Props>();

const onDrop: FileUploadOptions['onDrop'] = async (acceptFiles: ElectronFile[], _rejectReasons) => {
  if (acceptFiles.length) {
    props.handleDroppedFiles(acceptFiles.map(f => f.path))
  }
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
</script>

<template>
  <div class="dropzone" v-bind="getRootProps()">
    <input v-bind="getInputProps()" />
    <p v-if="isDragActive">Drop the files here ...</p>
    <p v-else>Drop files here, or click to browse to test</p>
  </div>
</template>

<style scoped>
.dropzone {
  width: 80%;
  margin: auto;
  padding: 1em;
  margin-top: 5px;
  border: 1px dashed gray;
  cursor: pointer;
}

.dropzone p {
  margin: 0;
}
</style>