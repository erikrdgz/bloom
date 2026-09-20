<script setup lang="ts">
import { pageCode } from './lib/inspect'
import BloomSelect from './components/ui/BloomSelect.vue'
import { computed, provide, nextTick, onUnmounted, ref, watch } from 'vue'
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Download,
  Sun,
  Moon,
  Menu,
  Check,
  Copy,
  Palette,
  Type,
  Ruler,
  Shapes,
} from 'lucide-vue-next'
import CreateSystemWizard from './components/CreateSystemWizard.vue'
import { useSystems } from './composables/useSystems'
import { loadFont } from './lib/fonts'
import BlossomScene from './components/BlossomScene.vue'
import StudioSidebar from './components/StudioSidebar.vue'
import ColorPalette from './components/ColorPalette.vue'
import ComponentLibrary from './components/ComponentLibrary.vue'
import MotionGuidelines from './components/MotionGuidelines.vue'
import ComponentPreview from './components/ComponentPreview.vue'
import SystemDialog from './components/SystemDialog.vue'
import IconStudio from './components/IconStudio.vue'
import {
  defaultSystem,
  parseSystem,
  exportCSS,
  foreground,
  fonts,
  systemTypeStyles,
  neutralPalettes,
  systemShadow,
  fontFamily,
  type DesignSystem,
} from './lib/system'
const { projects, activeId, system, addSystem, storageError } = useSystems()
let initialDark = false
try {
  initialDark =
    (localStorage.getItem('bloom-theme') ??
      localStorage.getItem('bough-theme') ??
      localStorage.getItem('formwork-theme')) === 'dark'
} catch {}
const dark = ref(initialDark)
provide('bloom-dark', dark)
const sectionDescriptions: Record<string, string> = {
  Colors: 'Edit the primary color and inspect the generated scale.',
  Typography: 'Font family, sizes, and weights.',
  'Spacing & shape': 'Base spacing, scale, and corner radius.',
  Components: 'States, interactions, and usage for each component.',
  Motion: 'Timing, easing, and accessible transitions.',
  'Icon set': 'Select icons and export an SVG sprite.',
}
const section = ref('Overview')
const pageHeading = ref<HTMLHeadingElement>()
const devMode = ref(false)
provide('bloom-dev-mode', devMode)
provide('bloom-system', system)
const mobileNav = ref(false)
const mode = ref<'create' | 'import' | 'export' | null>(null)
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout>
onUnmounted(() => clearTimeout(toastTimer))
const css = computed(() => pageCode(system.value, section.value))
const typeStyles = computed(() => systemTypeStyles(system.value))
const sampleStyle = computed(() => {
  const s = system.value
  const neutral = neutralPalettes[s.neutral][dark.value ? 'dark' : 'light']
  const factor = { calm: 1.4, standard: 1, snappy: 0.7 }[s.motion]
  return {
    '--primary': s.primary,
    '--on-primary': foreground(s.primary),
    '--secondary': s.secondary,
    '--sample-radius': `${s.radius}px`,
    '--sample-space': `${s.spacing}px`,
    '--sample-font': fontFamily(s.font),
    '--heading-font': fontFamily(s.headingFont),
    '--base-size': `${s.baseSize}px`,
    '--system-shadow': systemShadow(s),
    '--bg': neutral.background,
    '--surface': neutral.surface,
    '--sidebar': neutral.background,
    '--text': neutral.text,
    '--muted': dark.value ? '#a8b0b8' : '#687078',
    '--border': neutral.border,
    '--soft': neutral.background,
    '--ink': neutral.text,
    '--duration-fast': `${Math.round(120 * factor)}ms`,
    '--duration-standard': `${Math.round(200 * factor)}ms`,
    '--duration-deliberate': `${Math.round(320 * factor)}ms`,
  }
})
watch(
  () => [system.value.font, system.value.headingFont],
  () => {
    loadFont(system.value.font)
    loadFont(system.value.headingFont)
  },
  { immediate: true },
)
watch(storageError, (value) => {
  if (value) notify(value)
})
watch(dark, (value) => {
  try {
    localStorage.setItem('bloom-theme', value ? 'dark' : 'light')
  } catch {
    /* Theme still works without storage. */
  }
})
function notify(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 3500)
}
async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    notify('Copied to clipboard')
  } catch {
    notify('Clipboard unavailable. Use Export to download your tokens.')
  }
}
async function navigate(value: string) {
  section.value = value
  mobileNav.value = false
  await nextTick()
  pageHeading.value?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: 'instant' })
}
function openDialog(value: 'create' | 'import') {
  mode.value = value
  mobileNav.value = false
}
function apply(value: DesignSystem) {
  addSystem(value)
  section.value = 'Overview'
  notify(`${value.name} is ready to explore`)
}
</script>
<template>
  <div class="studio" :class="{ dark }" :style="sampleStyle">
    <div v-if="mobileNav" class="nav-scrim" @click="mobileNav = false"></div>
    <StudioSidebar
      :active="section"
      :name="system.name"
      :projects="projects"
      :active-id="activeId"
      @select="activeId = $event"
      :open="mobileNav"
      @navigate="navigate"
      @create="openDialog('create')"
      @import="openDialog('import')"
      @close="mobileNav = false"
    />
    <div class="main-shell">
      <header class="topbar">
        <div class="breadcrumb">
          <button
            class="icon-button mobile-menu"
            aria-label="Open navigation"
            @click="mobileNav = true"
          >
            <Menu :size="20" /></button
          ><span class="workspace-story">A living design library</span>
        </div>
        <div class="topbar-actions">
          <span class="local-status"><Check :size="14" />Local workspace</span
          ><button
            class="icon-button theme-button"
            :aria-label="dark ? 'Switch to light theme' : 'Switch to dark theme'"
            @click="dark = !dark"
          >
            <Sun v-if="dark" :size="19" /><Moon v-else :size="19" /></button
          ><span class="topbar-rule"></span
          ><button
            class="button dev-button"
            :class="{ enabled: devMode }"
            aria-label="Developer mode"
            :aria-pressed="devMode"
            @click="devMode = !devMode"
          >
            <Code2 :size="17" /><span>Dev mode</span
            ><span class="switch-mini" :class="{ on: devMode }"></span></button
          ><button class="button export-secondary" @click="mode = 'export'">
            <Download :size="16" /><span>Export</span>
          </button>
        </div>
      </header>
      <main>
        <div class="page-heading">
          <div>
            <h1 ref="pageHeading" tabindex="-1">
              {{ section === 'Overview' ? system.name + ' library' : section }}
            </h1>
            <p>
              {{
                section === 'Overview'
                  ? 'A place for your visual language to take root and grow.'
                  : sectionDescriptions[section]
              }}
            </p>
          </div>
          <button class="button accent create-primary" @click="mode = 'create'">
            Create a system<ArrowUpRight :size="16" />
          </button>
        </div>
        <template v-if="section === 'Overview'">
          <BlossomScene :dark="dark" @explore="navigate('Components')" />
          <div class="stat-grid">
            <button
              v-for="stat in [
                { icon: Palette, count: '24', label: 'Color tokens', target: 'Colors' },
                { icon: Type, count: '6', label: 'Type styles', target: 'Typography' },
                { icon: Ruler, count: '8', label: 'Spacing steps', target: 'Spacing & shape' },
                {
                  icon: Shapes,
                  count: String(system.icons.length),
                  label: 'Selected icons',
                  target: 'Icon set',
                },
              ]"
              :key="stat.label"
              @click="navigate(stat.target)"
            >
              <component :is="stat.icon" :size="18" /><strong>{{ stat.count }}</strong
              ><span>{{ stat.label }}</span
              ><ArrowUpRight :size="16" />
            </button>
          </div>
          <div class="section-line">
            <h2>Foundations</h2>
            <span></span>
          </div>
          <div class="overview-grid">
            <ColorPalette :primary="system.primary" @select="navigate('Colors')" @copy="copy" />
            <section class="panel type-panel">
              <div class="panel-title">
                <div>
                  <h2>Typography</h2>
                </div>
                <button
                  class="icon-button"
                  aria-label="Edit typography"
                  @click="navigate('Typography')"
                >
                  <ArrowUpRight :size="20" />
                </button>
              </div>
              <div class="type-specimen" :style="{ fontFamily: system.font }">
                <span>Aa</span>
                <div>
                  <strong>{{ system.font }}</strong
                  ><small>Font family</small
                  ><span class="weight-label">REGULAR / MEDIUM / BOLD</span>
                </div>
              </div>
              <div class="type-alphabet">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz 0123456789
              </div>
            </section>
            <ComponentPreview @explore="navigate('Components')" />
            <section class="panel rhythm-panel">
              <div class="panel-title">
                <div>
                  <h2>Spacing</h2>
                </div>
                <button
                  class="icon-button"
                  aria-label="Edit spacing and shape"
                  @click="navigate('Spacing & shape')"
                >
                  <ArrowUpRight :size="20" />
                </button>
              </div>
              <div class="spacing-chart">
                <div v-for="n in [1, 2, 3, 4, 6, 8, 12, 16]" :key="n">
                  <span :style="{ height: `${n * system.spacing * 1.5}px` }"></span
                  ><code>{{ n * system.spacing }}</code>
                </div>
              </div>
              <div class="panel-foot">
                <span>{{ system.spacing }}px base unit</span
                ><span>{{ system.radius }}px corner radius</span>
              </div>
            </section>
          </div>
        </template>
        <template v-else-if="section === 'Colors'"
          ><div class="editor-toolbar">
            <label>Primary color <input v-model="system.primary" type="color" /></label
            ><code>{{ system.primary }}</code
            ><label>Secondary color<input v-model="system.secondary" type="color" /></label
            ><label
              >Neutrals<BloomSelect v-model="system.neutral">
                <option value="stone">Stone</option>
                <option value="slate">Slate</option>
                <option value="zinc">Zinc</option>
              </BloomSelect></label
            >
          </div>
          <ColorPalette
            :primary="system.primary"
            expanded
            label="Primary"
            @select="notify('Use the primary color picker above to edit your palette')"
            @copy="copy" />
          <div style="height: 20px"></div>
          <ColorPalette
            :primary="system.secondary"
            label="Secondary"
            expanded
            @select="notify('Use the secondary color picker above to edit your palette')"
            @copy="copy"
        /></template>
        <template v-else-if="section === 'Typography'"
          ><div class="editor-toolbar">
            <label
              >Body font
              <BloomSelect v-model="system.font">
                <option v-for="font in fonts" :key="font">{{ font }}</option>
              </BloomSelect></label
            ><label
              >Heading font<BloomSelect v-model="system.headingFont">
                <option v-for="font in fonts" :key="font">{{ font }}</option>
              </BloomSelect></label
            ><label
              >Base size<BloomSelect v-model.number="system.baseSize">
                <option v-for="size in [14, 15, 16, 17, 18, 19, 20]" :key="size" :value="size">
                  {{ size }}px
                </option>
              </BloomSelect></label
            ><label
              >Scale<BloomSelect v-model.number="system.typeRatio">
                <option v-for="ratio in [1.125, 1.2, 1.25, 1.333]" :key="ratio" :value="ratio">
                  {{ ratio }}
                </option>
              </BloomSelect></label
            >
          </div>
          <section class="panel typography-list" :style="{ fontFamily: system.font }">
            <div v-for="style in typeStyles" :key="style.name">
              <div>
                <span>{{ style.name }}</span
                ><code>{{ style.size }}px / {{ style.weight }}</code>
              </div>
              <p
                :style="{
                  fontSize: `${style.size / 16}rem`,
                  fontWeight: style.weight,
                  fontFamily: fontFamily(
                    ['Body', 'Label'].includes(style.name) ? system.font : system.headingFont,
                  ),
                }"
              >
                Ideas take shape.
              </p>
            </div>
          </section></template
        >
        <template v-else-if="section === 'Spacing & shape'"
          ><div class="editor-toolbar">
            <label
              >Base unit <input v-model.number="system.spacing" type="range" min="2" max="8" />{{
                system.spacing
              }}px</label
            ><label
              >Corner radius
              <input v-model.number="system.radius" type="range" min="0" max="24" />{{
                system.radius
              }}px</label
            >
            <label
              >Elevation<BloomSelect v-model="system.elevation">
                <option value="none">Flat</option>
                <option value="soft">Soft</option>
                <option value="raised">Raised</option>
              </BloomSelect></label
            >
          </div>
          <section class="panel spacing-editor">
            <h2>Spacing scale</h2>
            <div v-for="n in [1, 2, 3, 4, 6, 8, 12, 16]" :key="n" class="spacing-token">
              <code>space-{{ n }}</code
              ><span :style="{ width: `${n * system.spacing * 3}px` }"></span
              ><code>{{ n * system.spacing }}px</code>
            </div>
            <div class="shape-preview">
              <span :style="{ borderRadius: `${system.radius}px` }"></span>
              <p>
                Shared radius and elevation.<br /><code>--radius: {{ system.radius }}px</code>
              </p>
            </div>
          </section></template
        >
        <ComponentLibrary v-else-if="section === 'Components'" @notify="notify" />
        <MotionGuidelines
          :profile="system.motion"
          @profile="system.motion = $event"
          v-else-if="section === 'Motion'"
          @copy="copy"
        />
        <IconStudio
          v-else-if="section === 'Icon set'"
          :selected="system.icons"
          @update="system.icons = $event"
        />
        <section v-if="devMode && section !== 'Components'" class="dev-panel">
          <div class="panel-title">
            <div>
              <h2>{{ section }} · Developer reference</h2>
            </div>
            <button class="button" @click="copy(css)">
              <Copy :size="16" />Copy
              {{ section === 'Overview' ? 'reference' : section === 'Icon set' ? 'markup' : 'CSS' }}
            </button>
          </div>
          <pre><code>{{ css }}</code></pre>
        </section>
        <footer class="library-footer">
          <span>Bloom · Local workspace</span
          ><button class="text-button" @click="mode = 'export'">Export tokens</button>
        </footer>
      </main>
    </div>
    <CreateSystemWizard :open="mode === 'create'" @close="mode = null" @create="apply" />
    <SystemDialog
      :mode="mode === 'create' ? null : mode"
      :system="system"
      @close="mode = null"
      @apply="apply"
      @notify="notify"
    />
    <Transition name="toast"
      ><div v-if="toast" class="toast-message" role="status">
        <Check :size="17" />{{ toast }}
      </div></Transition
    >
  </div>
</template>
