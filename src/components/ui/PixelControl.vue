<script setup lang="ts">
import { useId } from 'vue'
const props = withDefaults(
  defineProps<{ modelValue: number; label: string; min?: number; max?: number; unit?: string }>(),
  { min: 0, max: 100, unit: 'px' },
)
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
const id = useId()
function preview(event: Event) {
  const el = event.target as HTMLInputElement
  if (
    el.value !== '' &&
    Number.isFinite(el.valueAsNumber) &&
    el.valueAsNumber >= props.min &&
    el.valueAsNumber <= props.max
  )
    emit('update:modelValue', Math.round(el.valueAsNumber))
}
function update(event: Event) {
  const el = event.target as HTMLInputElement
  if (el.value === '' || !Number.isFinite(el.valueAsNumber)) {
    el.value = String(props.modelValue)
    return
  }
  const value = Math.round(Math.max(props.min, Math.min(props.max, el.valueAsNumber)))
  emit('update:modelValue', value)
  el.value = String(value)
}
</script>
<template>
  <div class="pixel-control">
    <label :for="id">{{ label }}</label>
    <div>
      <input :id="id" type="range" :min="min" :max="max" :value="modelValue" @input="update" /><span
        ><input
          :aria-label="`${label} value`"
          type="number"
          :min="min"
          :max="max"
          :value="modelValue"
          @input="preview"
          @change="update"
        /><small>{{ unit }}</small></span
      >
    </div>
  </div>
</template>
<style scoped>
.pixel-control {
  display: grid;
  gap: 8px;
}
.pixel-control > label {
  font-size: 12px;
}
.pixel-control > div {
  display: flex;
  gap: 16px;
  align-items: center;
}
.pixel-control input[type='range'] {
  width: 100%;
  max-width: none;
  min-width: 0;
  accent-color: var(--text);
  height: 3px;
}
.pixel-control span {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 3px;
  padding-right: 7px;
}
.pixel-control input[type='number'] {
  width: 53px;
  padding: 7px 3px 7px 8px;
  border: 0;
  background: transparent;
  color: var(--text);
  font:
    11px 'IBM Plex Mono',
    monospace;
}
.pixel-control small {
  font-size: 9px;
  color: var(--muted);
}
</style>
