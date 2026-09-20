<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X, Upload, ArrowRight, Download } from 'lucide-vue-next'
import { parseSystem, exportCSS, download, type DesignSystem } from '../lib/system'
const props = defineProps<{ mode: 'import' | 'export' | null; system: DesignSystem }>()
const emit = defineEmits<{ close: []; apply: [system: DesignSystem]; notify: [message: string] }>()
const dialog = ref<HTMLDialogElement>()
const error = ref('')
const source = ref('')
const exporting = ref(false)
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
async function saveBundle(format: 'code' | 'pdf') {
  exporting.value = true
  error.value = ''
  try {
    const snapshot = parseSystem(JSON.stringify(props.system))
    const filename = snapshot.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'bloom'
    let blob: Blob
    if (format === 'pdf') {
      const { createSystemPDF } = await import('../lib/exportPDF')
      blob = createSystemPDF(snapshot).output('blob')
    } else {
      const { exportCode } = await import('../lib/exportBundle')
      blob = new Blob([new Uint8Array(exportCode(snapshot))], { type: 'application/zip' })
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}-system.${format === 'pdf' ? 'pdf' : 'zip'}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    emit('notify', `${format === 'pdf' ? 'PDF reference' : 'Code bundle'} downloaded`)
  } catch {
    error.value = 'Export failed. Please try again.'
  } finally {
    exporting.value = false
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
          Take {{ system.name }} into your next project with a complete code starter or a shareable
          PDF reference.
        </p>
        <button class="export-option" :disabled="exporting" @click="saveBundle('code')">
          <span
            ><strong>Code starter · ZIP</strong
            ><small
              >70 shades, light/dark UI roles, component CSS, working demo and token JSON</small
            ></span
          ><Download :size="20" />
        </button>
        <button class="export-option" :disabled="exporting" @click="saveBundle('pdf')">
          <span
            ><strong>Design system reference · PDF</strong
            ><small
              >Six pages of palettes, semantic roles, typography, spacing and component
              mappings</small
            ></span
          ><Download :size="20" />
        </button>
        <p v-if="exporting" role="status">Preparing your export...</p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <button class="export-option" @click="save('css')">
          <span
            ><strong>CSS custom properties</strong
            ><small>Palettes, UI roles, typography, spacing and motion</small></span
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
