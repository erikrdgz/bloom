<script setup lang="ts">
import { computed, ref, watch, useId } from 'vue'
import { Copy } from 'lucide-vue-next'
import { componentCode, codeFormats, type CodeFormat } from '../lib/componentCode'
import type { SavedComponent } from '../lib/builder'
import type { DesignSystem } from '../lib/system'
const props = defineProps<{ component: SavedComponent; system: DesignSystem; disabled: boolean }>()
const emit = defineEmits<{ copy: [value: string] }>()
const format = ref<CodeFormat>('Plain')
const fileIndex = ref(0)
const id = useId()
const files = computed(() =>
  componentCode(props.component, props.system, format.value, props.disabled),
)
const current = computed(() => files.value[Math.min(fileIndex.value, files.value.length - 1)]!)
watch(format, () => {
  fileIndex.value = 0
})
watch(
  () => props.component.kind,
  () => {
    fileIndex.value = 0
  },
)
// Display tokens as text nodes; edited labels can never become live markup.
const tokens = computed(() => {
  const pattern =
    /(\/\*[\s\S]*?\*\/|<!--[^]*?-->|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:import|from|export|default|function|const|let|return|if|else|new|class|readonly|private|static|true|false|type|void)\b|\b\d+(?:\.\d+)?(?:px|em|rem|%)?\b)/g
  const text = current.value.content
  const result: { text: string; kind: string }[] = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const start = match.index!
    if (start > last) result.push({ text: text.slice(last, start), kind: '' })
    const value = match[0]
    const kind =
      value.startsWith('//') || value.startsWith('/*') || value.startsWith('<!--')
        ? 'comment'
        : /^["']/.test(value)
          ? 'string'
          : /^\d/.test(value)
            ? 'number'
            : 'keyword'
    result.push({ text: value, kind })
    last = start + value.length
  }
  if (last < text.length) result.push({ text: text.slice(last), kind: '' })
  return result
})
</script>
<template>
  <section class="component-code-viewer" aria-label="Component code">
    <div class="code-toolbar">
      <div class="code-formats" role="group" aria-label="Code format">
        <button
          v-for="option in codeFormats"
          :key="option"
          :aria-pressed="format === option"
          @click="format = option"
        >
          {{ option }}
        </button>
      </div>
      <button class="button code-copy" @click="emit('copy', current.content)">
        <Copy :size="14" aria-hidden="true" />Copy file
      </button>
    </div>
    <div class="code-files" role="group" aria-label="Code files">
      <button
        v-for="(file, index) in files"
        :key="file.name"
        :aria-pressed="fileIndex === index"
        :aria-controls="id"
        @click="fileIndex = index"
      >
        {{ file.name }}
      </button>
    </div>
    <pre
      :id="id"
      tabindex="0"
      :aria-label="current.name"
    ><code><span v-for="(token, index) in tokens" :key="index" :class="token.kind ? 'syntax-' + token.kind : undefined">{{ token.text }}</span></code></pre>
  </section>
</template>
<style scoped>
.component-code-viewer {
  min-width: 0;
  background: var(--surface);
}
.code-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
}
.code-formats {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.code-formats button {
  min-height: 40px;
  padding: 8px 14px;
  border-radius: 22px;
  background: transparent;
  color: var(--muted);
  font-size: 12px;
}
.code-formats button[aria-pressed='true'] {
  background: var(--primary);
  color: var(--on-primary);
}
.code-copy {
  font-size: 11px;
}
.code-files {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 20px 12px;
}
.code-files button {
  background: transparent;
  color: var(--muted);
  font: 11px var(--code-font);
  padding: 8px 10px;
  border-radius: 8px;
  white-space: nowrap;
  min-height: 36px;
}
.code-files button[aria-pressed='true'] {
  background: var(--soft);
  color: var(--text);
}
pre {
  margin: 0;
  padding: 22px;
  overflow: auto;
  height: 420px;
  max-width: 100%;
  color: #e6edf5;
  background: #161e29;
  tab-size: 2;
  font: 12px/1.8 var(--code-font);
}
code {
  font: inherit;
}
.syntax-string {
  color: #b7d3ec;
}
.syntax-keyword {
  color: #edb4c8;
}
.syntax-number {
  color: #edc59d;
}
.syntax-comment {
  color: #9cabbc;
}
button:focus-visible,
pre:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -3px;
}
@media (max-width: 700px) {
  .code-toolbar {
    padding: 12px;
  }
  .code-formats button {
    padding-inline: 12px;
  }
  .code-files {
    padding-inline: 12px;
  }
  pre {
    height: 360px;
    padding: 16px;
    font-size: 11px;
  }
}
</style>
