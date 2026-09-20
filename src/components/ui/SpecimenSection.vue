<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { defaultSystem, exportCSS, type DesignSystem } from '../../lib/system'
import { componentTokens } from '../../lib/inspect'
const devMode = inject<Ref<boolean>>('bloom-dev-mode', ref(false))
const system = inject<Ref<DesignSystem>>('bloom-system', ref(defaultSystem))
const dark = inject<Ref<boolean>>('bloom-dark', ref(false))
const props = defineProps<{ title: string; note: string; code?: string }>()
const tokens = computed(() => {
  const names = componentTokens[props.title] ?? [
    'color-primary',
    'color-surface',
    'color-text',
    'radius',
    'space-2',
  ]
  const lines = exportCSS(system.value).split('\n')
  return (
    ':root {\n' +
    names
      .map((name) => {
        const values = lines.filter((line) => line.trim().startsWith(`--${name}:`))
        return dark.value ? values.at(-1) : values[0]
      })
      .filter(Boolean)
      .join('\n') +
    '\n}'
  )
})
const copied = ref(false)
async function copyCode() {
  try {
    await navigator.clipboard.writeText([props.code, tokens.value].filter(Boolean).join('\n\n'))
    copied.value = true
  } catch {
    copied.value = false
  }
}
</script>
<template>
  <section class="specimen-section">
    <header>
      <h2>{{ title }}</h2>
      <p>{{ note }}</p>
    </header>
    <div class="specimen-content"><slot /></div>
    <details v-if="code || devMode" class="specimen-code">
      <summary>{{ devMode ? title + ' · Developer reference' : 'Usage' }}</summary>
      <pre v-if="code"><code>{{ code }}</code></pre>
      <template v-if="devMode"
        ><p class="component-token-label">Resolved tokens</p>
        <pre><code>{{ tokens }}</code></pre>
        <button class="button" @click="copyCode">
          {{ copied ? 'Copied' : 'Copy reference' }}
        </button></template
      >
    </details>
  </section>
</template>
