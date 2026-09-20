<script setup lang="ts">
import { computed } from 'vue'
import { uiTokens, type DesignSystem } from '../lib/system'
const props = defineProps<{ system: DesignSystem; dark: boolean }>()
const colors = computed(() => uiTokens(props.system, props.dark ? 'dark' : 'light'))
</script>
<template>
  <section class="token-hierarchy">
    <h2>From foundations to interface</h2>
    <p>
      A palette describes available colors. A semantic role explains their purpose. A component
      token applies that role to a specific part of the interface.
    </p>
    <div class="hierarchy-steps">
      <div>
        <small>01 · Primitive</small><strong>Color palette</strong><code>--color-error-500</code>
      </div>
      <div>
        <small>02 · Semantic role</small><strong>Invalid input</strong><code>--error-border</code>
      </div>
      <div>
        <small>03 · Component</small><strong>Field validation border</strong
        ><code>--input-invalid</code>
      </div>
    </div>
    <h3>UI roles</h3>
    <p>
      Surfaces, text, borders, actions, and feedback receive separate light and dark values.
      Component aliases follow those roles when appearance changes.
    </p>
    <div class="ui-role-list">
      <div
        v-for="name in [
          'surface-canvas',
          'surface-default',
          'text-primary',
          'text-secondary',
          'border-strong',
          'action-primary',
          'text-link',
          'focus-ring',
        ]"
        :key="name"
      >
        <i :style="{ background: colors[name] }" /><code>--{{ name }}</code
        ><span>{{ colors[name] }}</span>
      </div>
    </div>
  </section>
</template>
