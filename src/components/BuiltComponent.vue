<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, Check, ChevronDown, Info } from 'lucide-vue-next'
import { componentStyle, type SavedComponent } from '../lib/builder'
const props = defineProps<{ component: SavedComponent; disabled?: boolean }>()
const style = computed(() => componentStyle(props.component.style))
const checked = ref(true)
const tab = ref(0)
const clicked = ref(false)
function moveTab(event: KeyboardEvent, offset: number) {
  tab.value = (tab.value + offset + 3) % 3
  ;(event.currentTarget as HTMLElement).querySelectorAll('button')[tab.value]?.focus()
}
</script>
<template>
  <div class="built-specimen" :style="{ '--piece-color': component.style.background }">
    <button
      v-if="component.kind === 'button'"
      class="built-piece built-button"
      :style="style"
      :disabled="disabled"
      @click="clicked = !clicked"
    >
      {{ clicked ? 'Nice work!' : component.label }}<ArrowRight :size="16" />
    </button>
    <label v-else-if="component.kind === 'input'" class="built-field"
      ><span>{{ component.label }}</span
      ><input class="built-piece" :style="style" placeholder="Start typing…" :disabled="disabled"
    /></label>
    <label v-else-if="component.kind === 'textarea'" class="built-field"
      ><span>{{ component.label }}</span
      ><textarea
        class="built-piece"
        :style="style"
        rows="3"
        placeholder="Put it into words."
        :disabled="disabled"
      />
    </label>
    <label v-else-if="component.kind === 'select'" class="built-field"
      ><span>{{ component.label }}</span
      ><select class="built-piece" :style="style" :disabled="disabled">
        <option>Design</option>
        <option>Engineering</option>
        <option>Product</option>
      </select></label
    >
    <span v-else-if="component.kind === 'badge'" class="built-piece built-badge" :style="style">{{
      component.label
    }}</span>
    <article v-else-if="component.kind === 'card'" class="built-piece built-card" :style="style">
      <h3>{{ component.label }}</h3>
      <p>A card groups related content and actions.</p>
      <ArrowRight :size="20" />
    </article>
    <div
      v-else-if="component.kind === 'alert'"
      class="built-piece built-alert"
      :style="style"
      role="status"
    >
      <Info :size="20" />
      <div>
        <strong>{{ component.label }}</strong>
        <p>Your changes have been saved.</p>
      </div>
    </div>
    <label v-else-if="component.kind === 'switch'" class="built-check-label"
      ><button
        role="switch"
        :aria-checked="checked"
        :aria-label="component.label"
        :disabled="disabled"
        class="built-piece built-switch"
        :style="style"
        @click="checked = !checked"
      >
        <span :class="{ checked }" /></button
      >{{ component.label }}</label
    >
    <label v-else-if="component.kind === 'checkbox'" class="built-check-label"
      ><button
        role="checkbox"
        :aria-checked="checked"
        :aria-label="component.label"
        :disabled="disabled"
        class="built-piece built-checkbox"
        :style="style"
        @click="checked = !checked"
      >
        <Check :size="18" :style="{ opacity: checked ? 1 : 0 }" /></button
      >{{ component.label }}</label
    >
    <div v-else-if="component.kind === 'tabs'" class="built-tabs">
      <div
        role="tablist"
        aria-label="Preview tabs"
        @keydown.right.prevent="moveTab($event, 1)"
        @keydown.left.prevent="moveTab($event, -1)"
      >
        <button
          v-for="(label, i) in [component.label, 'Activity', 'Settings']"
          :key="i"
          role="tab"
          :aria-selected="tab === i"
          :tabindex="tab === i ? 0 : -1"
          class="built-piece"
          :style="tab === i ? style : {}"
          :disabled="disabled"
          @click="tab = i"
        >
          {{ label }}
        </button>
      </div>
      <p role="tabpanel">
        {{
          [
            'Everything in its place.',
            'Your latest updates appear here.',
            'Make yourself at home.',
          ][tab]
        }}
      </p>
    </div>
    <div v-else-if="component.kind === 'tooltip'" class="built-tooltip-wrap">
      <span class="built-piece built-tooltip" :style="style" role="tooltip">{{
        component.label
      }}</span
      ><span class="built-tooltip-anchor">A helpful detail <Info :size="14" /></span>
    </div>
    <div v-else-if="component.kind === 'progress'" class="built-field">
      <span>{{ component.label }} <span>64%</span></span>
      <div
        class="built-progress"
        role="progressbar"
        :aria-label="component.label"
        :aria-valuenow="64"
        :aria-valuemin="0"
        :aria-valuemax="100"
      >
        <div class="built-piece" :style="{ ...style, width: '64%' }" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.built-specimen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-family: var(--sample-font);
  color: inherit;
}
.built-piece {
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.4;
  max-width: 100%;
  overflow-wrap: anywhere;
  transition: opacity 0.15s;
}
button.built-piece {
  cursor: pointer;
}
button.built-piece:hover {
  filter: brightness(0.97);
}
.built-piece:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
.built-piece:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.built-button,
.built-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.built-button svg,
.built-alert svg {
  flex-shrink: 0;
}
.built-dot {
  width: 6px;
  height: 6px;
  border-radius: 100%;
  background: currentColor;
  flex-shrink: 0;
}
.built-field {
  display: grid;
  gap: 10px;
  width: min(100%, 320px);
  font-size: 12px;
}
.built-field > span {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.built-field input,
.built-field textarea,
.built-field select {
  width: 100%;
  min-width: 0;
}
.built-field textarea {
  resize: vertical;
}
.built-card {
  width: 290px;
}
.built-card h3 {
  font-size: 1.4em;
  font-family: var(--heading-font);
  margin: 24px 0 8px;
}
.built-card p,
.built-alert p {
  font-size: 0.85em;
  line-height: 1.6;
  margin: 8px 0 18px;
}
.built-caption {
  font-size: 9px;
  letter-spacing: 1.4px;
}
.built-alert {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  width: 340px;
}
.built-alert p {
  margin: 4px 0 0;
}
.built-check-label {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}
.built-switch {
  min-width: 66px;
  display: flex;
}
.built-switch span {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: currentColor;
  transform: translateX(-6px);
}
.built-switch span.checked {
  transform: translateX(6px);
  margin-left: auto;
}
.built-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}
.built-tabs {
  width: 100%;
}
.built-tabs [role='tablist'] {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}
.built-tabs button {
  border: 0;
  padding: 12px;
  background: transparent;
  color: inherit;
  font-size: 12px;
}
.built-tabs p {
  text-align: center;
  font-size: 12px;
  margin: 24px 0 0;
}
.built-tooltip-wrap {
  display: grid;
  justify-items: center;
  gap: 18px;
}
.built-tooltip {
  position: relative;
  text-align: center;
}
.built-tooltip::after {
  content: '';
  position: absolute;
  left: calc(50% - 5px);
  bottom: -5px;
  width: 10px;
  height: 10px;
  background: inherit;
  transform: rotate(45deg);
}
.built-tooltip-anchor {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  border-bottom: 1px dashed currentColor;
  padding-bottom: 3px;
}
.built-progress {
  width: 100%;
  background: #8793a726;
  border-radius: 4px;
}
</style>
