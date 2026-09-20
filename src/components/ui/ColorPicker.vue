<script setup lang="ts">
import { ref, watch, useId } from 'vue'
import { hexToHsl, hslToHex, normalizeHex } from '../../lib/color'
const props = defineProps<{ modelValue: string; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
const panel = ref<HTMLElement>()
const position = ref({})
const hex = ref(props.modelValue)
const channels = ref(hexToHsl(props.modelValue))
const error = ref('')
watch(
  () => props.modelValue,
  (value) => {
    hex.value = value
    if (hslToHex(channels.value.h, channels.value.s, channels.value.l) !== value)
      channels.value = hexToHsl(value)
  },
)
function open(event: MouseEvent) {
  const r = (event.currentTarget as HTMLElement).getBoundingClientRect()
  position.value = {
    left: Math.max(12, Math.min(r.left, window.innerWidth - 316)) + 'px',
    top: Math.max(12, Math.min(r.bottom + 8, window.innerHeight - 390)) + 'px',
  }
  panel.value?.showPopover()
}
function commit() {
  const value = normalizeHex(hex.value)
  if (!value) {
    error.value = 'Enter a 3 or 6 digit hex color.'
    return
  }
  error.value = ''
  hex.value = value
  channels.value = hexToHsl(value)
  emit('update:modelValue', value)
}
function adjust() {
  error.value = ''
  const { h, s, l } = channels.value
  emit('update:modelValue', hslToHex(h, s, l))
}
</script>
<template>
  <div class="color-picker">
    <button
      type="button"
      class="color-trigger"
      :aria-label="`${label}: ${modelValue}`"
      aria-haspopup="dialog"
      :aria-controls="id"
      @click="open"
    >
      <i :style="{ background: modelValue }" /><span
        >{{ label }}<code>{{ modelValue }}</code></span
      >
    </button>
    <div
      :id="id"
      ref="panel"
      popover
      class="color-picker-panel"
      role="dialog"
      :aria-label="`${label} picker`"
      :style="position"
    >
      <div class="color-picker-heading">
        <strong>{{ label }}</strong
        ><button type="button" aria-label="Close color picker" @click="panel?.hidePopover()">
          ×
        </button>
      </div>
      <div class="color-picker-preview" :style="{ background: modelValue }" />
      <label
        >Hex color<input
          v-model="hex"
          style="background: #fff; color: #202936"
          :aria-invalid="!!error"
          :aria-describedby="error ? id + '-error' : undefined"
          spellcheck="false"
          @change="commit"
          @keydown.enter.prevent="commit"
      /></label>
      <p v-if="error" :id="id + '-error'" role="alert">{{ error }}</p>
      <label
        >Hue <output>{{ Math.round(channels.h) }}°</output
        ><input
          aria-label="Hue"
          v-model.number="channels.h"
          type="range"
          min="0"
          max="360"
          class="hue-slider"
          @input="adjust"
      /></label>
      <label
        >Saturation <output>{{ Math.round(channels.s) }}%</output
        ><input
          aria-label="Saturation"
          v-model.number="channels.s"
          type="range"
          min="0"
          max="100"
          :style="{
            background: `linear-gradient(to right,hsl(${channels.h} 0% 50%),hsl(${channels.h} 100% 50%))`,
          }"
          @input="adjust"
      /></label>
      <label
        >Lightness <output>{{ Math.round(channels.l) }}%</output
        ><input
          aria-label="Lightness"
          v-model.number="channels.l"
          type="range"
          min="0"
          max="100"
          :style="{
            background: `linear-gradient(to right,#000,hsl(${channels.h} ${channels.s}% 50%),#fff)`,
          }"
          @input="adjust"
      /></label>
    </div>
  </div>
</template>
<style>
.color-picker {
  min-width: 0;
}
.color-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: inherit;
  text-align: left;
  cursor: pointer;
  width: 100%;
}
.color-trigger i {
  width: 42px;
  height: 42px;
  border-radius: 9px;
  box-shadow: inset 0 0 0 1px #0001;
  flex-shrink: 0;
}
.color-trigger span {
  display: grid;
  gap: 4px;
  font-size: 12px;
  text-transform: capitalize;
}
.color-trigger code {
  font-size: 11px;
  text-transform: none;
}
.color-trigger:hover {
  border-color: var(--accent);
}
.color-picker-panel {
  position: fixed;
  margin: 0;
  width: 292px;
  max-width: calc(100vw - 24px);
  max-height: calc(100dvh - 24px);
  overflow: auto;
  padding: 18px;
  border: 1px solid #cbd2dd;
  border-radius: 16px;
  background: #fff;
  color: #202936;
  box-shadow: 0 12px 44px #0003;
  font:
    13px 'DM Sans',
    sans-serif;
}
.color-picker-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.color-picker-heading button {
  border: 0;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: inherit;
}
.color-picker-preview {
  height: 42px;
  border-radius: 9px;
  margin-bottom: 12px;
  border: 1px solid #0001;
}
.color-picker-panel label {
  display: block;
  margin-top: 12px;
}
.color-picker-panel output {
  float: right;
}
.color-picker-panel input:not([type='range']) {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 6px;
  border: 1px solid #aab5c5;
  border-radius: 8px;
  padding: 8px;
  font: inherit;
}
.color-picker-panel input[type='range'] {
  display: block;
  appearance: none;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  margin: 10px 0 4px;
  cursor: pointer;
}
.color-picker-panel input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  background: #334155;
  box-shadow: 0 0 0 1px #64748b;
}
.color-picker-panel input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  background: #334155;
}
.color-picker-panel .hue-slider {
  background: linear-gradient(to right, red, #ff0, #0f0, #0ff, #00f, #f0f, red);
}
.color-picker-panel input:focus-visible,
.color-trigger:focus-visible {
  outline: 2px solid #5269b2;
  outline-offset: 3px;
}
.color-picker-panel p {
  color: #9f2424;
  font-size: 12px;
}
</style>
