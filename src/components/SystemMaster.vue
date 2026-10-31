<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight, Plus, Search, ArrowRight } from 'lucide-vue-next'
import FontAwesomeIcon from './ui/FontAwesomeIcon.vue'
import { iconLabel } from '../lib/icons'
import {
  colorFamilies,
  palette,
  systemTypeStyles,
  fontFamily,
  uiTokens,
  systemShadow,
  neutralPalettes,
  type DesignSystem,
} from '../lib/system'
import { componentLabels, resolveComponent } from '../lib/builder'
import BuiltComponent from './BuiltComponent.vue'
import ComponentLibrary from './ComponentLibrary.vue'
const props = defineProps<{ system: DesignSystem; dark: boolean }>()
const emit = defineEmits<{
  edit: [id: string]
  build: []
  navigate: [section: string]
  notify: [message: string]
}>()
const search = ref('')
const filtered = computed(() =>
  props.system.components.filter((c) =>
    `${c.name} ${componentLabels[c.kind]}`.toLowerCase().includes(search.value.toLowerCase()),
  ),
)
const colors = computed(() => colorFamilies(props.system))
</script>
<template>
  <div class="master-summary">
    <div>
      <h2>{{ system.name }}</h2>
      <p v-if="system.description">{{ system.description }}</p>
    </div>
    <div class="master-counts">
      <span><strong>70</strong>color tokens</span><span><strong>6</strong>type styles</span
      ><span
        ><strong>{{ system.components.length }}</strong
        >saved components</span
      >
    </div>
  </div>
  <nav class="master-jump" aria-label="System view sections">
    <a href="#master-components">Your components</a><a href="#master-colors">Colors</a
    ><a href="#master-type">Typography</a><a href="#master-rhythm">Spacing & shape</a
    ><a href="#master-motion">Motion & icons</a><a href="#master-catalog">Component catalog</a>
  </nav>
  <section id="master-components" class="master-section">
    <div class="master-section-title">
      <div>
        <h2>Saved components</h2>
      </div>
      <button class="button" @click="emit('build')"><Plus :size="15" />Build a component</button>
    </div>
    <div v-if="!system.components.length" class="master-empty">
      <h3>No saved components yet</h3>
      <p>Save a component in the builder to add it to this system.</p>
      <button class="text-button" @click="emit('build')">
        Open the component builder <ArrowRight :size="15" />
      </button>
    </div>
    <template v-else
      ><label class="master-search"
        ><Search :size="15" /><input
          v-model="search"
          placeholder="Find a saved component…"
          aria-label="Find a saved component"
        /><span>{{ filtered.length }} of {{ system.components.length }}</span></label
      >
      <div class="master-component-grid">
        <article v-for="component in filtered" :key="component.id" class="master-component-card">
          <div class="master-component-stage">
            <BuiltComponent :component="resolveComponent(component, system.components)" />
          </div>
          <div class="master-component-caption">
            <div>
              <span>{{ componentLabels[component.kind] }}</span>
              <h3>{{ component.name }}</h3>
              <small class="master-link-status">{{
                component.linkedTo
                  ? 'Linked to ' + system.components.find((c) => c.id === component.linkedTo)?.name
                  : component.buttonRole === 'primary'
                    ? 'System button · source'
                    : component.buttonRole
                      ? 'Detached · ' + component.buttonRole
                      : 'Independent'
              }}</small>
            </div>
            <button
              class="icon-button"
              :aria-label="`Edit ${component.name}`"
              @click="emit('edit', component.id)"
            >
              <ArrowUpRight :size="18" />
            </button>
          </div>
        </article>
      </div>
      <p v-if="!filtered.length" class="property-hint">
        No components match “{{ search }}”. Try another name.
      </p></template
    >
  </section>
  <section id="master-colors" class="master-section">
    <div class="master-section-title">
      <div>
        <h2>Colors</h2>
      </div>
      <button class="text-button" @click="emit('navigate', 'Colors')">
        Edit colors <ArrowUpRight :size="15" />
      </button>
    </div>
    <div class="master-palette">
      <div v-for="(hex, name) in colors" :key="name" class="master-color-row">
        <span>{{ name }}</span>
        <div>
          <div v-for="shade in palette(hex)" :key="shade.step">
            <i :style="{ background: shade.color }" :title="shade.color" /><code>{{
              shade.step
            }}</code
            ><small>{{ shade.color }}</small>
          </div>
        </div>
      </div>
    </div>
    <details class="master-token-details">
      <summary>Semantic roles · {{ dark ? 'Dark' : 'Light' }} appearance</summary>
      <dl>
        <div v-for="(hex, name) in uiTokens(system, dark ? 'dark' : 'light')" :key="name">
          <dt><i :style="{ background: hex }" />{{ name }}</dt>
          <dd>{{ hex }}</dd>
        </div>
      </dl>
    </details>
    <div class="master-surfaces">
      <div
        v-for="(values, mode) in neutralPalettes[system.neutral]"
        :key="mode"
        :style="{ background: values.background, color: values.text, borderColor: values.border }"
      >
        <strong>{{ mode }} surfaces</strong
        ><span v-for="(value, token) in values" :key="token"
          ><i :style="{ background: value, borderColor: values.border }" />{{ token
          }}<code>{{ value }}</code></span
        >
      </div>
    </div>
  </section>
  <section id="master-type" class="master-section">
    <div class="master-section-title">
      <div>
        <h2>Typography</h2>
      </div>
      <button class="text-button" @click="emit('navigate', 'Typography')">
        Edit typography <ArrowUpRight :size="15" />
      </button>
    </div>
    <div class="master-type-meta">
      <span
        >Heading / <strong>{{ system.headingFont }}</strong></span
      ><span
        >Body / <strong>{{ system.font }}</strong></span
      ><span
        >Scale / <strong>{{ system.typeRatio }}</strong></span
      >
    </div>
    <div class="master-types">
      <div v-for="type in systemTypeStyles(system)" :key="type.name">
        <span
          >{{ type.name }}<code>{{ type.size }}px / {{ type.weight }}</code></span
        >
        <p
          :style="{
            fontSize: type.size + 'px',
            fontWeight: type.weight,
            fontFamily: fontFamily(
              ['Body', 'Label'].includes(type.name) ? system.font : system.headingFont,
            ),
          }"
        >
          Ideas take shape.
        </p>
      </div>
    </div>
  </section>
  <section id="master-rhythm" class="master-section">
    <div class="master-section-title">
      <div>
        <h2>Spacing & shape</h2>
      </div>
      <button class="text-button" @click="emit('navigate', 'Spacing & shape')">
        Edit foundations <ArrowUpRight :size="15" />
      </button>
    </div>
    <div class="master-rhythm">
      <div class="master-spacing">
        <div v-for="n in [1, 2, 3, 4, 6, 8, 12, 16]" :key="n">
          <code>{{ n * system.spacing }}px</code
          ><i :style="{ width: n * system.spacing * 2 + 'px' }" /><small>space-{{ n }}</small>
        </div>
      </div>
      <div class="master-shape">
        <div :style="{ borderRadius: system.radius + 'px', boxShadow: systemShadow(system) }" />
        <span>{{ system.radius }}px radius</span><small>{{ system.elevation }} elevation</small>
      </div>
    </div>
  </section>
  <section id="master-motion" class="master-section">
    <div class="master-section-title">
      <div>
        <h2>Motion & icons</h2>
      </div>
    </div>
    <div class="master-finishing">
      <div>
        <h3>{{ system.motion }} motion</h3>
        <p v-for="(duration, label) in { Fast: 120, Standard: 200, Deliberate: 320 }" :key="label">
          <span>{{ label }}</span
          ><code
            >{{
              Math.round(duration * { calm: 1.4, standard: 1, snappy: 0.7 }[system.motion])
            }}ms</code
          >
        </p>
        <button class="text-button" @click="emit('navigate', 'Motion')">
          View easing & motion <ArrowUpRight :size="14" />
        </button>
      </div>
      <div>
        <h3>{{ system.icons.length }} selected icons</h3>
        <div class="master-icons">
          <span v-for="icon in system.icons.slice(0, 24)" :key="icon"
            ><FontAwesomeIcon :name="icon" :size="22" /><small>{{ iconLabel(icon) }}</small></span
          >
        </div>
        <button class="text-button" @click="emit('navigate', 'Icon set')">
          {{ system.icons.length > 24 ? `View all ${system.icons.length} icons` : 'Edit icon set' }}
          <ArrowUpRight :size="14" />
        </button>
      </div>
    </div>
  </section>
  <section id="master-catalog" class="master-section">
    <div class="master-section-title">
      <div>
        <h2>Component catalog</h2>
      </div>
    </div>
    <details class="master-token-details">
      <summary>Explore the complete component catalog · 14 families</summary>
      <p class="property-hint">
        These reference components follow your system tokens. Your custom variants appear under
        Saved components.
      </p>
      <ComponentLibrary @notify="emit('notify', $event)" />
    </details>
  </section>
</template>
<style scoped>
.master-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  padding: 36px 0;
  border-block: 1px solid var(--border);
}
.master-summary h2 {
  font: 56px/1 var(--heading-font);
  margin: 14px 0;
  letter-spacing: -1px;
  overflow-wrap: anywhere;
}
.master-period {
  color: var(--primary);
}
.master-summary p {
  font-size: 12px;
  color: var(--muted);
  margin: 0;
  max-width: 430px;
  line-height: 1.6;
}
.master-counts {
  display: flex;
  gap: 28px;
  flex-shrink: 0;
}
.master-counts span {
  display: grid;
  gap: 8px;
  font-size: 10px;
  color: var(--muted);
}
.master-counts strong {
  font: 36px var(--heading-font);
  color: var(--text);
}
.master-jump {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border);
  padding: 18px 0;
}
.master-jump a {
  color: var(--muted);
  font-size: 11px;
  text-decoration: none;
}
.master-jump a:hover {
  color: var(--text);
}
.master-section {
  margin-top: 42px;
  scroll-margin-top: 24px;
}
.master-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.master-section-title h2 {
  font: 29px var(--heading-font);
  margin: 7px 0 0;
}
.master-empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 48px 24px;
  border: 1px dashed var(--border);
  text-align: center;
}
.empty-shapes {
  display: flex;
  align-items: center;
  gap: 8px;
}
.empty-shapes i {
  width: 24px;
  height: 24px;
  border: 1px solid var(--muted);
}
.empty-shapes i:nth-child(2) {
  width: 54px;
  border-radius: 20px;
  background: var(--primary);
  border: 0;
}
.empty-shapes i:nth-child(3) {
  border-radius: 7px;
  transform: rotate(12deg);
}
.master-empty h3 {
  font: 28px var(--heading-font);
  margin: 22px 0 0;
}
.master-empty p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
  max-width: 360px;
  margin: 10px 0 20px;
}
.master-search {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}
.master-search input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 0;
  color: var(--text);
  font: inherit;
  font-size: 12px;
  padding: 6px;
}
.master-search span {
  font-size: 10px;
}
.master-component-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.master-component-card {
  border: 1px solid var(--border);
  min-width: 0;
}
.master-component-stage {
  min-height: 230px;
  padding: 32px 20px;
  display: flex;
  align-items: center;
  background: var(--surface);
  background-image: radial-gradient(#7a8a8526 0.7px, transparent 0.7px);
  background-size: 16px 16px;
}
.master-component-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border);
}
.master-component-caption span {
  font-size: 9px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.master-component-caption h3 {
  font-size: 12px;
  font-weight: 500;
  margin: 5px 0 0;
  overflow-wrap: anywhere;
}
.master-palette {
  border: 1px solid var(--border);
  padding: 24px;
}
.master-color-row {
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}
.master-color-row:last-child {
  margin: 0;
}
.master-color-row > span {
  font-size: 11px;
  text-transform: capitalize;
}
.master-color-row > div {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 4px;
}
.master-color-row i {
  display: block;
  height: 36px;
  border: 1px solid #0001;
}
.master-color-row code {
  display: block;
  font-size: 9px;
  text-align: center;
  margin-top: 6px;
  color: var(--muted);
}
.master-color-row small {
  display: none;
}
.master-token-details {
  border: 1px solid var(--border);
  padding: 18px 22px;
  margin-top: 16px;
}
.master-token-details summary {
  cursor: pointer;
  font-size: 12px;
}
.master-token-details > .property-hint {
  margin: 20px 0;
}
.master-token-details dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
  font-size: 10px;
}
.master-token-details dl > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.master-token-details dt {
  display: flex;
  align-items: center;
  gap: 8px;
}
.master-token-details dd {
  margin: 0;
  font-family: monospace;
}
.master-token-details i {
  width: 12px;
  height: 12px;
  border: 1px solid #0003;
}
.master-surfaces {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}
.master-surfaces > div {
  display: grid;
  gap: 12px;
  padding: 24px;
  border: 1px solid;
}
.master-surfaces strong {
  font-size: 12px;
  text-transform: capitalize;
  margin-bottom: 8px;
}
.master-surfaces span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.master-surfaces i {
  width: 16px;
  height: 16px;
  border: 1px solid;
}
.master-surfaces code {
  margin-left: auto;
  font-size: 10px;
}
.master-type-meta {
  display: flex;
  gap: 24px;
  font-size: 11px;
  color: var(--muted);
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.master-type-meta strong {
  color: var(--text);
  font-weight: 500;
}
.master-types {
  border-top: 1px solid var(--border);
}
.master-types > div {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 20px;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding: 20px 0;
}
.master-types span {
  font-size: 11px;
}
.master-types code {
  display: block;
  color: var(--muted);
  font-size: 9px;
  margin-top: 6px;
}
.master-types p {
  margin: 0;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.master-rhythm {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--border);
}
.master-spacing {
  padding: 24px;
  display: grid;
  gap: 12px;
}
.master-spacing > div {
  display: flex;
  gap: 12px;
  align-items: center;
}
.master-spacing code {
  font-size: 10px;
  width: 36px;
  flex-shrink: 0;
}
.master-spacing i {
  height: 12px;
  background: var(--primary);
  max-width: 50%;
}
.master-spacing small {
  font-size: 9px;
  color: var(--muted);
}
.master-shape {
  border-left: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  font-size: 12px;
  padding: 24px;
}
.master-shape > div {
  width: 100px;
  height: 100px;
  background: var(--primary);
  margin-bottom: 10px;
}
.master-shape small {
  color: var(--muted);
}
.master-finishing {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--border);
}
.master-finishing > div {
  padding: 24px;
}
.master-finishing > div + div {
  border-left: 1px solid var(--border);
}
.master-finishing h3 {
  text-transform: capitalize;
  font-size: 13px;
  margin: 0 0 20px;
  font-weight: 500;
}
.master-finishing p {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}
.master-finishing .text-button {
  margin-top: 24px;
}
.master-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
}
.master-icons span {
  display: grid;
  gap: 8px;
  justify-items: center;
}
.master-icons small {
  font-size: 9px;
  color: var(--muted);
}
@media (min-width: 1500px) {
  .master-component-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .master-color-row small {
    display: block;
    text-align: center;
    font: 8px monospace;
    color: var(--muted);
    margin-top: 5px;
  }
}
@media (max-width: 1000px) {
  .master-summary {
    align-items: flex-start;
    flex-direction: column;
  }
  .master-counts {
    gap: 36px;
  }
  .master-token-details dl {
    grid-template-columns: 1fr;
  }
  .master-types > div {
    grid-template-columns: 100px minmax(0, 1fr);
  }
  .master-color-row {
    grid-template-columns: 1fr;
  }
  .master-rhythm,
  .master-finishing {
    grid-template-columns: 1fr;
  }
  .master-shape,
  .master-finishing > div + div {
    border-left: 0;
    border-top: 1px solid var(--border);
  }
}
@media (max-width: 600px) {
  .master-component-grid,
  .master-surfaces {
    grid-template-columns: 1fr;
  }
  .master-section-title {
    align-items: flex-start;
    flex-direction: column;
  }
  .master-palette {
    padding: 16px;
  }
  .master-types > div {
    grid-template-columns: 1fr;
  }
  .master-types p {
    max-width: 100%;
  }
  .master-summary h2 {
    font-size: 44px;
  }
  .master-counts {
    gap: 24px;
  }
  .master-jump {
    gap: 16px;
  }
}
</style>
