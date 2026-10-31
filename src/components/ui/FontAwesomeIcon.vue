<script setup lang="ts">
import { shallowRef, ref, watch } from 'vue'
import type { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { loadIcon, iconPaths } from '../../lib/icons'
const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 24 })
const icon = shallowRef<IconDefinition>()
const failed = ref(false)
watch(
  () => props.name,
  async (name, _, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    icon.value = undefined
    failed.value = false
    try {
      const definition = await loadIcon(name)
      if (!cancelled) icon.value = definition
    } catch {
      if (!cancelled) failed.value = true
    }
  },
  { immediate: true },
)
</script>
<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="icon ? `0 0 ${icon.icon[0]} ${icon.icon[1]}` : '0 0 24 24'"
    fill="currentColor"
    aria-hidden="true"
    class="fa-preview"
  >
    <template v-if="icon"><path v-for="path in iconPaths(icon)" :key="path" :d="path" /></template>
    <path v-else-if="failed" d="M11 6h2v8h-2zm0 10h2v2h-2z" />
  </svg>
</template>
