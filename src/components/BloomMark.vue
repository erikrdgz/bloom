<script setup lang="ts">
// Bloom's own mark, the same blossoming branch as the favicon and the social
// card. The sidebar and footer used a generic sprout glyph on an orange tile,
// which did not match the identity people see in a browser tab or a shared
// link.
withDefaults(defineProps<{ size?: number }>(), { size: 30 })
</script>

<template>
  <svg
    class="bloom-mark"
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    aria-hidden="true"
    focusable="false"
  >
    <rect width="32" height="32" rx="7" fill="#edb4c8" />
    <path
      d="M16 26V14M16 20C6 20 6 12 6 9c7 0 10 4 10 11Zm0-5C16 7 20 5 26 5c0 7-3 10-10 10Z"
      fill="none"
      stroke="#352631"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.bloom-mark {
  display: block;
  flex-shrink: 0;
}
</style>
