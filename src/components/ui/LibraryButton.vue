<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'quiet' | 'danger'
    size?: 'small' | 'medium' | 'large'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'medium', type: 'button' },
)
</script>
<template>
  <button
    :type="type"
    class="library-button"
    :class="[variant, size]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <LoaderCircle v-if="loading" class="loading-spinner" :size="16" aria-hidden="true" /><slot />
  </button>
</template>
