<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import type { DesignSystem } from '../../lib/system'
import { systemButtonStyle } from '../../lib/builder'
import { LoaderCircle } from 'lucide-vue-next'
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'quiet' | 'danger'
    size?: 'small' | 'medium' | 'large'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'medium', type: 'button' },
)
const system = inject<Ref<DesignSystem>>('bloom-system')
const customStyle = computed(() =>
  system?.value ? systemButtonStyle(system.value, props.variant) : undefined,
)
</script>
<template>
  <button
    :type="type"
    :style="customStyle"
    class="library-button"
    :class="[variant, size]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <LoaderCircle v-if="loading" class="loading-spinner" :size="16" aria-hidden="true" /><slot />
  </button>
</template>
