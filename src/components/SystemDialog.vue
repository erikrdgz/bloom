<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X, Upload, ArrowRight, Download } from 'lucide-vue-next'
import { parseSystem, exportCSS, download, type DesignSystem } from '../lib/system'
const props = defineProps<{ mode: 'import' | 'export' | null; system: DesignSystem }>()
const emit = defineEmits<{ close: []; apply: [system: DesignSystem]; notify: [message: string] }>()
const dialog = ref<HTMLDialogElement>()
const error = ref('')
const source = ref('')
watch(
  () => props.mode,
  async (mode) => {
    error.value = ''
    source.value = ''
    await nextTick()
    if (mode) dialog.value?.showModal()
    else dialog.value?.close()
  },
)
function importSystem() {
  try {
    emit('apply', parseSystem(source.value))
    emit('close')
  } catch (e) {
    error.value = (e as Error).message
  }
}
async function readFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 100000) {
    error.value = 'Please choose a JSON file smaller than 100 KB.'
    return
  }
  try {
    source.value = await file.text()
    error.value = ''
  } catch {
    error.value = 'Could not read this file. Try another file.'
  }
}
function save(format: 'json' | 'css') {
  download(
    `bloom-tokens.${format}`,
    format === 'json' ? JSON.stringify(props.system, null, 2) : exportCSS(props.system),
    format === 'json' ? 'application/json' : 'text/css',
  )
  emit('notify', `${format.toUpperCase()} export downloaded`)
}
</script>
<template>
  <dialog
    ref="dialog"
    aria-label="Design system workflow"
    @cancel.prevent="emit('close')"
    @click="
      (e) => {
        if (e.target === dialog) emit('close')
      }
    "
  >
    <div class="dialog-content">
      <div class="dialog-heading">
        <span class="eyebrow">DESIGN SYSTEM</span
        ><button class="icon-button" aria-label="Close dialog" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>
      <template v-if="mode === 'import'"
        ><h2>Import system</h2>
        <p>
          Import a Bloom JSON export. We validate tokens, normalize hex colors, and remove duplicate
          icons. Figma, CSS, and other token formats are planned.
        </p>
        <label class="file-upload"
          ><Upload :size="22" />Choose a JSON file<input
            type="file"
            accept=".json,application/json"
            @change="readFile" /></label
        ><label
          >Or paste your export<textarea
            v-model="source"
            rows="6"
            placeholder='{ "version": 1, … }'
          ></textarea>
        </label>
        <p class="muted">Importing adds a separate system to your workspace.</p>
        <p v-if="error" role="alert" class="error">{{ error }}</p>
        <button class="button accent" :disabled="!source.trim()" @click="importSystem">
          Validate & import<ArrowRight :size="16" /></button
      ></template>
      <template v-if="mode === 'export'"
        ><h2>Export system</h2>
        <p>
          Take {{ system.name }} into your next project. Export CSS variables for development or
          JSON to reopen in Bloom.
        </p>
        <button class="export-option" @click="save('css')">
          <span
            ><strong>CSS custom properties</strong
            ><small>Palette, font, spacing, radius & theme surfaces</small></span
          ><Download :size="20" /></button
        ><button class="export-option" @click="save('json')">
          <span
            ><strong>Bloom JSON</strong
            ><small>Editable system configuration · version 1</small></span
          ><Download :size="20" /></button
      ></template>
    </div>
  </dialog>
</template>
