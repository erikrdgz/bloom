<script setup lang="ts">
import SemanticColors from './SemanticColors.vue'
import BloomSelect from './ui/BloomSelect.vue'
import { computed, nextTick, ref, watch } from 'vue'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-vue-next'
import { fontCatalog, fontFamily } from '../lib/fonts'
import { directions, newDraft, applyDirection } from '../lib/presets'
import { exportCSS, parseSystem, systemTypeStyles, type DesignSystem } from '../lib/system'
import SystemPreview from './SystemPreview.vue'
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; create: [system: DesignSystem] }>()
const dialog = ref<HTMLDialogElement>()
const title = ref<HTMLHeadingElement>()
const step = ref(0)
const draft = ref(newDraft())
const direction = ref('product')
const error = ref('')
const steps = ['Project', 'Direction', 'Color', 'Typography', 'Details', 'Review']
const css = computed(() => exportCSS(draft.value))
const scale = computed(() => systemTypeStyles(draft.value))
watch(
  () => props.open,
  async (open) => {
    if (open) {
      step.value = 0
      draft.value = newDraft()
      direction.value = 'product'
      error.value = ''
      await nextTick()
      dialog.value?.showModal()
    } else dialog.value?.close()
  },
)
async function move(next: number) {
  if (next > step.value && step.value === 0 && !draft.value.name.trim()) {
    error.value = 'Enter a system name to continue.'
    return
  }
  error.value = ''
  step.value = next
  await nextTick()
  title.value?.focus()
  dialog.value?.querySelector('.wizard-scroll')?.scrollTo({ top: 0 })
}
function chooseDirection(id: string) {
  direction.value = id
  draft.value = applyDirection(draft.value, id)
}
function create() {
  try {
    emit('create', parseSystem(JSON.stringify(draft.value)))
    emit('close')
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>
<template>
  <dialog
    ref="dialog"
    class="create-wizard"
    aria-label="Create a design system"
    @cancel.prevent="emit('close')"
  >
    <div class="wizard-shell">
      <header class="wizard-header">
        <div>
          <span>Create a system</span><small>Step {{ step + 1 }} of {{ steps.length }}</small>
        </div>
        <button
          type="button"
          class="icon-button"
          aria-label="Close creation workflow"
          @click="emit('close')"
        >
          <X :size="21" />
        </button>
      </header>
      <ol class="wizard-steps" aria-label="Creation progress">
        <li
          v-for="(label, index) in steps"
          :key="label"
          :aria-current="step === index ? 'step' : undefined"
          :class="{ complete: index < step }"
        >
          <span
            ><Check v-if="index < step" :size="12" /><template v-else>{{
              index + 1
            }}</template></span
          >{{ label }}
        </li>
      </ol>
      <div class="wizard-scroll">
        <div class="wizard-grid">
          <form class="wizard-fields" @submit.prevent="step === 5 ? create() : move(step + 1)">
            <h2 ref="title" tabindex="-1">
              {{
                [
                  'What are you building?',
                  'Choose a starting direction',
                  'Build your color foundation',
                  'Set your typography',
                  'Define component behavior',
                  'Review your system',
                ][step]
              }}
            </h2>
            <template v-if="step === 0"
              ><p>
                Name the system and describe the product it will support. These details travel with
                your JSON export.
              </p>
              <label
                >System name<input
                  v-model="draft.name"
                  autofocus
                  maxlength="40"
                  placeholder="e.g. Northstar"
                  autocomplete="off" /></label
              ><label
                >Project description<textarea
                  v-model="draft.description"
                  maxlength="160"
                  rows="4"
                  placeholder="e.g. A customer portal for independent studios"
                ></textarea
                ><small>{{ draft.description.length }} / 160</small></label
              >
              <div class="wizard-note">
                Your current system stays in the workspace. Creating a new one adds a separate saved
                system.
              </div></template
            >
            <template v-else-if="step === 1"
              ><p>
                A direction sets coordinated defaults. You can adjust each choice in the following
                steps.
              </p>
              <fieldset class="direction-options">
                <legend class="sr-only">Visual direction</legend>
                <label
                  v-for="item in directions"
                  :key="item.id"
                  :class="{ chosen: direction === item.id }"
                  ><input
                    type="radio"
                    name="direction"
                    :checked="direction === item.id"
                    @change="chooseDirection(item.id)" />
                  <div>
                    <strong>{{ item.name }}</strong
                    ><span>{{ item.note }}</span
                    ><small>{{ item.values.headingFont }} + {{ item.values.font }}</small>
                  </div>
                  <i :style="{ background: item.values.primary }"></i
                ></label>
              </fieldset>
              <p class="wizard-hint">
                Switching direction resets style choices, but keeps your project name and
                description.
              </p></template
            >
            <template v-else-if="step === 2"
              ><p>
                Primary drives actions and selection. Secondary supports accents. Both generate a
                ten-step palette.
              </p>
              <div class="wizard-color-row">
                <label
                  >Primary<input v-model="draft.primary" type="color" /><code>{{
                    draft.primary
                  }}</code></label
                ><label
                  >Secondary<input v-model="draft.secondary" type="color" /><code>{{
                    draft.secondary
                  }}</code></label
                >
              </div>
              <SemanticColors :system="draft" compact @update="draft.feedback = $event" />
              <fieldset class="neutral-options">
                <legend>Neutral surfaces</legend>
                <label v-for="name in ['stone', 'slate', 'zinc'] as const" :key="name"
                  ><input
                    v-model="draft.neutral"
                    type="radio"
                    name="neutral"
                    :value="name"
                  /><span>{{ name }}</span></label
                >
              </fieldset>
              <p class="wizard-hint">
                Neutral surfaces provide background, text, border, and surface tokens for both light
                and dark appearances. Toggle the preview to compare.
              </p></template
            >
            <template v-else-if="step === 3"
              ><p>
                Choose separate fonts for headings and body text, then generate a consistent size
                hierarchy.
              </p>
              <label
                >Heading font<BloomSelect v-model="draft.headingFont">
                  <optgroup
                    v-for="category in ['Sans serif', 'Serif', 'Monospace', 'System']"
                    :key="category"
                    :label="category"
                  >
                    <option
                      v-for="font in fontCatalog.filter((font) => font.category === category)"
                      :key="font.name"
                      :value="font.name"
                    >
                      {{ font.name }}
                    </option>
                  </optgroup>
                </BloomSelect></label
              ><label
                >Body font<BloomSelect v-model="draft.font">
                  <optgroup
                    v-for="category in ['Sans serif', 'Serif', 'Monospace', 'System']"
                    :key="category"
                    :label="category"
                  >
                    <option
                      v-for="font in fontCatalog.filter((font) => font.category === category)"
                      :key="font.name"
                      :value="font.name"
                    >
                      {{ font.name }}
                    </option>
                  </optgroup>
                </BloomSelect></label
              >
              <div class="wizard-two-col">
                <label
                  >Base size<BloomSelect v-model.number="draft.baseSize">
                    <option v-for="size in [14, 15, 16, 17, 18, 19, 20]" :key="size" :value="size">
                      {{ size }}px
                    </option>
                  </BloomSelect></label
                ><label
                  >Scale ratio<BloomSelect v-model.number="draft.typeRatio">
                    <option v-for="ratio in [1.125, 1.2, 1.25, 1.333]" :key="ratio" :value="ratio">
                      {{ ratio }}
                    </option>
                  </BloomSelect></label
                >
              </div>
              <div
                class="wizard-type-sample"
                :style="{ fontFamily: fontFamily(draft.headingFont) }"
              >
                Aa Bb Cc 0123
              </div>
              <p class="wizard-hint">
                12 Google Fonts families, plus the device font. Only selected families are loaded;
                font loading requires an internet connection.
              </p></template
            >
            <template v-else-if="step === 4"
              ><p>
                These choices determine component density, corners, depth, and transition speed.
              </p>
              <label
                >Base spacing · {{ draft.spacing }}px<input
                  v-model.number="draft.spacing"
                  type="range"
                  min="2"
                  max="8" /></label
              ><label
                >Corner radius · {{ draft.radius }}px<input
                  v-model.number="draft.radius"
                  type="range"
                  min="0"
                  max="24"
              /></label>
              <div class="wizard-two-col">
                <label
                  >Elevation<BloomSelect v-model="draft.elevation">
                    <option value="none">Flat</option>
                    <option value="soft">Soft shadow</option>
                    <option value="raised">Raised</option>
                  </BloomSelect></label
                ><label
                  >Motion<BloomSelect v-model="draft.motion">
                    <option value="snappy">Snappy · 140ms</option>
                    <option value="standard">Standard · 200ms</option>
                    <option value="calm">Calm · 280ms</option>
                  </BloomSelect></label
                >
              </div>
              <label class="wizard-checkbox"
                ><input
                  type="checkbox"
                  :checked="draft.icons.length > 0"
                  @change="
                    draft.icons = ($event.target as HTMLInputElement).checked
                      ? ['heart', 'star', 'bolt', 'moon', 'sun', 'check']
                      : []
                  "
                />Include six starter icons</label
              >
              <p class="wizard-hint">
                The motion profile scales all transition durations. Reduced-motion support is
                included in every export.
              </p></template
            >
            <template v-else
              ><p>
                {{ draft.name }} will be added to your workspace. Review the values below, or go
                back to refine them.
              </p>
              <dl class="wizard-summary">
                <div>
                  <dt>Typography</dt>
                  <dd>{{ draft.headingFont }} / {{ draft.font }}</dd>
                </div>
                <div>
                  <dt>Type scale</dt>
                  <dd>{{ scale.map((style) => style.size + 'px').join(' · ') }}</dd>
                </div>
                <div>
                  <dt>Colors</dt>
                  <dd>70 palette shades · {{ draft.neutral }} neutrals</dd>
                </div>
                <div>
                  <dt>Spacing / shape</dt>
                  <dd>
                    {{ draft.spacing }}px base · {{ draft.radius }}px radius · {{ draft.elevation }}
                  </dd>
                </div>
                <div>
                  <dt>Motion / icons</dt>
                  <dd>{{ draft.motion }} · {{ draft.icons.length }} icons</dd>
                </div>
              </dl>
              <details class="wizard-output">
                <summary>Inspect generated CSS</summary>
                <pre><code>{{ css }}</code></pre>
              </details>
              <p class="wizard-hint">
                Your system includes 14 component examples connected to these foundations. Export
                CSS or JSON after creating it.
              </p></template
            >
            <p v-if="error" role="alert" class="field-error">{{ error }}</p>
            <button type="submit" hidden tabindex="-1">Continue</button>
          </form>
          <SystemPreview :system="draft" />
        </div>
      </div>
      <footer class="wizard-footer">
        <button type="button" class="button" @click="step === 0 ? emit('close') : move(step - 1)">
          <ArrowLeft v-if="step > 0" :size="15" />{{ step === 0 ? 'Cancel' : 'Back' }}</button
        ><span>Saved only when you create</span
        ><button v-if="step < 5" type="button" class="button export-button" @click="move(step + 1)">
          Continue<ArrowRight :size="15" /></button
        ><button v-else type="button" class="button export-button" @click="create">
          Create system<Check :size="15" />
        </button>
      </footer>
    </div>
  </dialog>
</template>
