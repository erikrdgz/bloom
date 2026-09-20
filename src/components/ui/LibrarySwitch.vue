<script setup lang="ts">
const model = defineModel<boolean>({ required: true })
defineProps<{ label: string; disabled?: boolean }>()
</script>
<template>
  <label class="library-switch"
    ><input v-model="model" type="checkbox" role="switch" :disabled="disabled" /><span
      aria-hidden="true"
      class="library-switch-track"
    ></span
    ><span>{{ label }}</span></label
  >
</template>
