<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Link2,
  Unlink,
  RotateCcw,
  SlidersHorizontal,
  MousePointer2,
  Type,
  AlignLeft,
  ChevronDown,
  Tag,
  Square,
  Info,
  ToggleRight,
  CheckSquare,
  PanelTop,
  MessageSquare,
  Minus,
} from 'lucide-vue-next'
import {
  componentKinds,
  componentLabels,
  makeComponent,
  numericControls,
  presets,
  applyPreset,
  resolveComponent,
  type ComponentKind,
  type NumericControl,
  type SavedComponent,
} from '../lib/builder'
import type { DesignSystem } from '../lib/system'
import BuiltComponent from './BuiltComponent.vue'
import ComponentCodeViewer from './ComponentCodeViewer.vue'
import ColorPicker from './ui/ColorPicker.vue'
import PixelControl from './ui/PixelControl.vue'
import PropertyGroup from './ui/PropertyGroup.vue'
const props = defineProps<{ system: DesignSystem; original: boolean; editId?: string }>()
const emit = defineEmits<{ save: [value: SavedComponent]; overview: []; copy: [value: string] }>()
const icons = [
  MousePointer2,
  Type,
  AlignLeft,
  ChevronDown,
  Tag,
  Square,
  Info,
  ToggleRight,
  CheckSquare,
  PanelTop,
  MessageSquare,
  Minus,
]
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))
const drafts = reactive<Partial<Record<ComponentKind, SavedComponent>>>({})
function startingComponent(kind: ComponentKind) {
  const saved = props.system.components.find(
    (c) => c.kind === kind && (kind === 'button' ? c.buttonRole === 'primary' : !c.linkedTo),
  )
  return saved ? clone(saved) : makeComponent(kind, props.system)
}
const corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const
const draft = ref(startingComponent('button'))
const linked = ref(corners.every((key) => draft.value.style[key] === draft.value.style.topLeft))
const previewDark = ref(false)
const view = ref<'preview' | 'code'>('preview')
const previewDisabled = ref(false)
const openGroup = ref('corners')
function toggleGroup(group: string) {
  openGroup.value = openGroup.value === group ? '' : group
}
const resolved = computed(() => resolveComponent(draft.value, props.system.components))
const parent = computed(() => props.system.components.find((c) => c.id === draft.value.linkedTo))
const persisted = computed(() => props.system.components.find((c) => c.id === draft.value.id))
const dirty = computed(() => JSON.stringify(persisted.value) !== JSON.stringify(draft.value))
const valid = computed(() => !!draft.value.name.trim() && !!draft.value.label.trim())
watch(
  () => props.editId,
  (id) => {
    const saved = props.system.components.find((c) => c.id === id)
    if (saved) {
      draft.value = clone(saved)
      linked.value = corners.every((k) => saved.style[k] === saved.style.topLeft)
    }
  },
  { immediate: true },
)
function choose(kind: ComponentKind) {
  drafts[draft.value.kind] = clone(draft.value)
  draft.value = drafts[kind] ? clone(drafts[kind]!) : startingComponent(kind)
  linked.value = corners.every((k) => draft.value.style[k] === draft.value.style.topLeft)
}
function numeric(key: NumericControl, value: number) {
  draft.value.style[key] = value
  if (linked.value && corners.includes(key as (typeof corners)[number]))
    corners.forEach((k) => (draft.value.style[k] = value))
}
function save() {
  if (!valid.value) return
  draft.value.name = draft.value.name.trim()
  draft.value.label = draft.value.label.trim()
  emit('save', clone(draft.value))
}
function duplicate() {
  const source = draft.value
  draft.value = {
    ...clone(resolved.value),
    id: crypto.randomUUID(),
    name: `${source.name.slice(0, 48)} / Variant`,
    linkedTo: source.id,
  }
  delete draft.value.buttonRole
}
function detach() {
  draft.value = clone(resolved.value)
  delete draft.value.linkedTo
}
</script>
<template>
  <section class="builder-banner">
    <div class="builder-banner-copy">
      <h2>Make it yours.</h2>
      <p>Adjust appearance, preview states, and save reusable components.</p>
      <a href="#component-workbench" class="builder-banner-link"
        >Make your first component <ArrowRight :size="15"
      /></a>
    </div>
    <div class="builder-drawing" aria-hidden="true">
      <div class="drawing-object">
        <span>Make it yours</span><ArrowUpRight :size="19" /><i class="drawing-handle tl" /><i
          class="drawing-handle tr"
        /><i class="drawing-handle bl" /><i class="drawing-handle br" />
      </div>
      <div class="drawing-swatches"><i /><i /><i /></div>
    </div>
  </section>
  <div class="builder-section-heading">
    <div>
      <h2>Choose a component</h2>
    </div>
    <button class="text-button" @click="emit('overview')">
      View your system <ArrowUpRight :size="16" />
    </button>
  </div>
  <div class="component-picker" aria-label="Component types">
    <button
      v-for="(kind, index) in componentKinds"
      :key="kind"
      :class="{ selected: draft.kind === kind }"
      :aria-pressed="draft.kind === kind"
      @click="choose(kind)"
    >
      <component :is="icons[index]" :size="19" /><span>{{ componentLabels[kind] }}</span>
    </button>
  </div>
  <section id="component-workbench" class="component-workbench" aria-label="Component editor">
    <div class="workbench-main">
      <div class="workbench-view-controls">
        <div class="workbench-view-switch" role="group" aria-label="Component view">
          <button :aria-pressed="view === 'preview'" @click="view = 'preview'">Preview</button>
          <button :aria-pressed="view === 'code'" @click="view = 'code'">Code</button>
        </div>
        <span>{{ dirty ? 'Unsaved draft' : 'Saved to system' }}</span>
      </div>
      <div v-show="view === 'preview'">
        <div class="canvas-toolbar">
          <div class="canvas-mode" aria-label="Preview background">
            <button
              :aria-pressed="!previewDark"
              :class="{ active: !previewDark }"
              @click="previewDark = false"
            >
              Light</button
            ><button
              :aria-pressed="previewDark"
              :class="{ active: previewDark }"
              @click="previewDark = true"
            >
              Dark
            </button>
          </div>
        </div>
        <div class="builder-canvas" :class="{ 'canvas-dark': previewDark }">
          <div class="canvas-specimen">
            <BuiltComponent :key="draft.kind" :component="resolved" :disabled="previewDisabled" />
          </div>
        </div>
        <div
          class="canvas-footer"
          v-if="
            ['button', 'input', 'textarea', 'select', 'switch', 'checkbox', 'tabs'].includes(
              draft.kind,
            )
          "
        >
          <label><input v-model="previewDisabled" type="checkbox" /> Disabled state</label>
        </div>
      </div>
      <ComponentCodeViewer
        v-show="view === 'code'"
        :component="draft"
        :system="system"
        :disabled="previewDisabled"
        @copy="emit('copy', $event)"
      />
      <div class="builder-presets">
        <h3>Presets</h3>
        <div>
          <button
            v-for="preset in presets"
            :key="preset"
            :disabled="!!draft.linkedTo"
            @click="draft.style = applyPreset(draft, preset, system)"
          >
            <i :class="'preset-' + preset.toLowerCase().replaceAll(' ', '-')" />{{ preset }}
          </button>
        </div>
        <p>
          {{
            draft.linkedTo
              ? 'Detach this variant to apply a different preset.'
              : 'Presets replace appearance settings. Your name and text stay yours.'
          }}
        </p>
      </div>
    </div>
    <aside class="builder-properties" aria-label="Component properties">
      <div class="properties-title">
        <h3><SlidersHorizontal :size="16" />Make it yours</h3>
        <button
          class="icon-button"
          :disabled="!!draft.linkedTo"
          aria-label="Reset appearance to system defaults"
          title="Reset appearance"
          @click="draft.style = makeComponent(draft.kind, system).style"
        >
          <RotateCcw :size="15" />
        </button>
      </div>
      <div class="properties-scroll">
        <PropertyGroup
          title="Content"
          :summary="draft.name"
          :open="openGroup === 'content'"
          @toggle="toggleGroup('content')"
        >
          <label class="builder-text-field"
            >Component name<input
              v-model="draft.name"
              maxlength="60"
              placeholder="e.g. Button / Primary" /></label
          ><label class="builder-text-field"
            >Preview text<input
              v-model="draft.label"
              maxlength="120"
              placeholder="Give it a little context"
          /></label>
        </PropertyGroup>
        <PropertyGroup
          title="Corners"
          :summary="
            corners.every((k) => resolved.style[k] === resolved.style.topLeft)
              ? resolved.style.topLeft + 'px'
              : 'Mixed'
          "
          :open="openGroup === 'corners'"
          @toggle="toggleGroup('corners')"
        >
          <fieldset class="property-fields" :disabled="!!draft.linkedTo">
            <legend class="sr-only">Corner properties</legend>
            <div class="property-subheading">
              <label
                ><input
                  v-model="linked"
                  type="checkbox"
                  @change="linked && corners.forEach((k) => (draft.style[k] = draft.style.topLeft))"
                />Link corners</label
              ><span v-if="draft.linkedTo" class="property-hint">Inherited</span>
            </div>
            <PixelControl
              v-if="linked"
              label="Corner radius"
              :model-value="resolved.style.topLeft"
              :max="100"
              @update:model-value="numeric('topLeft', $event)"
            />
            <template v-else
              ><PixelControl
                v-for="key in corners"
                :key="key"
                :label="numericControls[key].label"
                :model-value="resolved.style[key]"
                :max="100"
                @update:model-value="numeric(key, $event)"
            /></template>
          </fieldset>
        </PropertyGroup>
        <PropertyGroup
          title="Spacing & type"
          :summary="resolved.style.fontSize + 'px type'"
          :open="openGroup === 'layout'"
          @toggle="toggleGroup('layout')"
        >
          <fieldset class="property-fields" :disabled="!!draft.linkedTo">
            <legend class="sr-only">Spacing and type properties</legend>
            <PixelControl
              v-for="key in ['paddingX', 'paddingY', 'fontSize'] as const"
              :key="key"
              :label="numericControls[key].label"
              :model-value="resolved.style[key]"
              :min="numericControls[key].min"
              :max="numericControls[key].max"
              @update:model-value="numeric(key, $event)"
            />
          </fieldset>
        </PropertyGroup>
        <PropertyGroup
          title="Colors"
          :summary="draft.style.background"
          :open="openGroup === 'color'"
          @toggle="toggleGroup('color')"
          ><div class="property-fields">
            <ColorPicker v-model="draft.style.background" label="Fill color" /><ColorPicker
              v-model="draft.style.color"
              label="Text color"
            />
            <p class="property-hint">Start from your palette</p>
            <div class="system-swatches">
              <button
                v-for="(color, name) in {
                  primary: system.primary,
                  secondary: system.secondary,
                  ...system.feedback,
                }"
                :key="name"
                :style="{ background: color }"
                :aria-label="`Use ${name} as fill`"
                :title="`${name} · ${color}`"
                @click="draft.style.background = color"
              />
            </div></div
        ></PropertyGroup>
        <PropertyGroup
          title="Border"
          :summary="resolved.style.borderWidth + 'px · ' + resolved.style.borderStyle"
          :open="openGroup === 'border'"
          @toggle="toggleGroup('border')"
          ><div class="property-fields">
            <fieldset class="property-fields" :disabled="!!draft.linkedTo">
              <legend class="sr-only">Border shape properties</legend>
              <PixelControl
                label="Border width"
                :model-value="resolved.style.borderWidth"
                :max="12"
                @update:model-value="numeric('borderWidth', $event)"
              /><label class="builder-text-field"
                >Border style<select
                  :value="resolved.style.borderStyle"
                  @change="
                    draft.style.borderStyle = ($event.target as HTMLSelectElement)
                      .value as typeof draft.style.borderStyle
                  "
                >
                  <option>solid</option>
                  <option>dashed</option>
                  <option>dotted</option>
                </select></label
              >
            </fieldset>
            <ColorPicker v-model="draft.style.borderColor" label="Border color" /></div
        ></PropertyGroup>
        <PropertyGroup
          title="Drop shadow"
          :summary="
            resolved.style.shadowOpacity
              ? resolved.style.shadowBlur + 'px · ' + resolved.style.shadowOpacity + '%'
              : 'Off'
          "
          :open="openGroup === 'shadow'"
          @toggle="toggleGroup('shadow')"
        >
          <fieldset class="property-fields" :disabled="!!draft.linkedTo">
            <legend class="sr-only">Drop shadow properties</legend>
            <PixelControl
              v-for="key in ['shadowY', 'shadowBlur', 'shadowOpacity'] as const"
              :key="key"
              :label="numericControls[key].label"
              :model-value="resolved.style[key]"
              :min="numericControls[key].min"
              :max="numericControls[key].max"
              :unit="key === 'shadowOpacity' ? '%' : 'px'"
              @update:model-value="numeric(key, $event)"
            /><ColorPicker
              :model-value="resolved.style.shadowColor"
              label="Shadow color"
              @update:model-value="draft.style.shadowColor = $event"
            />
          </fieldset>
        </PropertyGroup>
        <PropertyGroup
          title="Glow"
          :summary="
            resolved.style.glowBlur && resolved.style.glowOpacity
              ? resolved.style.glowBlur + 'px · ' + resolved.style.glowOpacity + '%'
              : 'Off'
          "
          :open="openGroup === 'glow'"
          @toggle="toggleGroup('glow')"
        >
          <fieldset class="property-fields" :disabled="!!draft.linkedTo">
            <legend class="sr-only">Glow properties</legend>
            <PixelControl
              v-for="key in ['glowBlur', 'glowOpacity'] as const"
              :key="key"
              :label="numericControls[key].label"
              :model-value="resolved.style[key]"
              :max="numericControls[key].max"
              :unit="key === 'glowOpacity' ? '%' : 'px'"
              @update:model-value="numeric(key, $event)"
            /><ColorPicker
              :model-value="resolved.style.glowColor"
              label="Glow color"
              @update:model-value="draft.style.glowColor = $event"
            />
          </fieldset>
        </PropertyGroup>
        <PropertyGroup
          title="Linking"
          :summary="
            parent ? 'Linked' : draft.buttonRole === 'primary' ? 'System source' : 'Independent'
          "
          :open="openGroup === 'linking'"
          @toggle="toggleGroup('linking')"
        >
          <div class="component-link-panel">
            <template v-if="parent"
              ><strong><Link2 :size="13" />Linked to {{ parent.name }}</strong>
              <p>
                Shape, spacing, border width, shadow, and glow follow the source. Colors stay yours.
              </p>
              <button class="text-button" @click="detach">
                <Unlink :size="13" />Detach this variant
              </button></template
            >
            <template v-else-if="draft.buttonRole"
              ><strong>{{
                draft.buttonRole === 'primary'
                  ? 'System button · source'
                  : `System ${draft.buttonRole} · detached`
              }}</strong>
              <p>
                {{
                  draft.buttonRole === 'primary'
                    ? 'Your linked buttons follow this appearance throughout the system.'
                    : 'This button keeps its own appearance when the source changes.'
                }}
              </p>
              <button
                v-if="
                  draft.buttonRole !== 'primary' &&
                  system.components.some((c) => c.buttonRole === 'primary')
                "
                class="text-button"
                @click="
                  draft.linkedTo = system.components.find((c) => c.buttonRole === 'primary')!.id
                "
              >
                <Link2 :size="13" />Relink to system button
              </button></template
            >
            <template v-else-if="draft.kind === 'button'"
              ><strong>{{
                system.components.some((c) => c.buttonRole === 'primary')
                  ? 'Independent button'
                  : 'Your first system button'
              }}</strong>
              <p>
                {{
                  system.components.some((c) => c.buttonRole === 'primary')
                    ? 'Save a standalone variant, or use this as the source for your system buttons.'
                    : 'Saving also creates linked secondary, quiet, and danger variants.'
                }}
              </p>
              <button
                v-if="!draft.linkedTo && system.components.some((c) => c.buttonRole === 'primary')"
                class="text-button"
                @click="draft.buttonRole = 'primary'"
              >
                Use as system button <ArrowUpRight :size="13" /></button
            ></template>
            <template v-else
              ><strong>Independent component</strong>
              <p>After saving, create linked variants that follow this appearance.</p></template
            >
          </div>
        </PropertyGroup>
      </div>
      <div class="builder-save">
        <p>
          {{
            original
              ? 'Saving creates your own editable copy of Bloom.'
              : `Save to ${system.name}. Stored in this browser.`
          }}
        </p>
        <button class="button builder-save-button" :disabled="!valid || !dirty" @click="save">
          <Check :size="16" />{{
            original ? 'Save to my system' : persisted ? 'Save changes' : 'Save to system'
          }}</button
        ><button v-if="persisted" class="text-button" :disabled="dirty" @click="duplicate">
          <Link2 :size="13" />Create linked variant</button
        ><small v-if="!valid" role="status">Add a name and preview text to save.</small>
      </div>
    </aside>
  </section>
</template>
