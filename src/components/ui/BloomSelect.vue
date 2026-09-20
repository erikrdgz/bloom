<script setup lang="ts">
import { computed, nextTick, onMounted, onUpdated, ref, useId } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'
const props = defineProps<{
  modelValue?: string | number
  value?: string | number
  modelModifiers?: { number?: boolean }
}>()
const emit = defineEmits<{ 'update:modelValue': [value: any]; change: [event: Event] }>()
const source = ref<HTMLSelectElement>()
const trigger = ref<HTMLButtonElement>()
const menu = ref<HTMLElement>()
const options = ref<{ value: string; label: string; disabled: boolean }[]>([])
const open = ref(false)
const active = ref(0)
const position = ref({})
const id = useId()
const accessibleLabel = ref('Choose an option')
const selected = computed(() =>
  String(props.modelValue ?? props.value ?? options.value[0]?.value ?? ''),
)
const label = computed(() => options.value.find((o) => o.value === selected.value)?.label ?? '')
function sync() {
  const parentLabel = source.value?.closest('label')?.cloneNode(true) as HTMLElement | undefined
  parentLabel?.querySelector('.bloom-select')?.remove()
  if (parentLabel?.textContent?.trim()) accessibleLabel.value = parentLabel.textContent.trim()

  const items = Array.from(source.value?.options ?? []).map((o) => ({
    value: o.value,
    label: o.textContent?.trim() ?? '',
    disabled: o.disabled,
  }))
  if (JSON.stringify(items) !== JSON.stringify(options.value)) options.value = items
}
onMounted(sync)
onUpdated(sync)
async function show() {
  if (open.value) return close()
  const rect = trigger.value!.getBoundingClientRect()
  const below = window.innerHeight - rect.bottom
  position.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    top: below > 220 ? `${rect.bottom + 6}px` : 'auto',
    bottom: below > 220 ? 'auto' : `${window.innerHeight - rect.top + 6}px`,
    maxHeight: `${Math.min(300, Math.max(below, rect.top) - 20)}px`,
  }
  active.value = Math.max(
    0,
    options.value.findIndex((o) => o.value === selected.value),
  )
  open.value = true
  await nextTick()
  menu.value?.showPopover()
  menu.value?.focus()
  reveal()
}
function close() {
  menu.value?.hidePopover()
  open.value = false
}
function reveal() {
  menu.value?.querySelector(`[data-index="${active.value}"]`)?.scrollIntoView({ block: 'nearest' })
}
function choose(index: number) {
  const option = options.value[index]
  if (!option || option.disabled) return
  const value = props.modelModifiers?.number ? Number(option.value) : option.value
  emit('update:modelValue', value)
  if (source.value) {
    source.value.value = option.value
    source.value.dispatchEvent(new Event('change'))
  }
  close()
  trigger.value?.focus()
}
function key(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    trigger.value?.focus()
    return
  }
  if (event.key === 'Tab') {
    close()
    trigger.value?.focus()
    return
  }
  event.preventDefault()
  if (event.key === 'Enter' || event.key === ' ') return choose(active.value)
  if (event.key === 'ArrowDown') active.value = (active.value + 1) % options.value.length
  else if (event.key === 'ArrowUp')
    active.value = (active.value - 1 + options.value.length) % options.value.length
  else if (event.key === 'Home') active.value = 0
  else if (event.key === 'End') active.value = options.value.length - 1
  else if (event.key.length === 1) {
    const index = options.value.findIndex((o) =>
      o.label.toLowerCase().startsWith(event.key.toLowerCase()),
    )
    if (index >= 0) active.value = index
  }
  reveal()
}
</script>
<template>
  <span class="bloom-select">
    <select ref="source" @change="emit('change', $event)" hidden aria-hidden="true" tabindex="-1">
      <slot />
    </select>
    <button
      ref="trigger"
      type="button"
      class="bloom-select-trigger"
      role="combobox"
      :aria-label="accessibleLabel"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="id"
      @click="show"
      @keydown.down.prevent="show"
      @keydown.up.prevent="show"
    >
      <span>{{ label }}</span
      ><ChevronDown :size="15" />
    </button>
    <div
      v-if="open"
      :id="id"
      ref="menu"
      popover="auto"
      role="listbox"
      :aria-label="accessibleLabel"
      :aria-activedescendant="`${id}-${active}`"
      tabindex="-1"
      class="bloom-select-menu"
      :style="position"
      @keydown="key"
      @toggle="open = $event.newState === 'open'"
    >
      <button
        v-for="(option, index) in options"
        :key="option.value"
        type="button"
        role="option"
        :aria-selected="selected === option.value"
        :disabled="option.disabled"
        :data-index="index"
        :id="`${id}-${index}`"
        :class="{ highlighted: index === active }"
        @pointermove="active = index"
        @click="choose(index)"
      >
        <span>{{ option.label }}</span
        ><Check v-if="selected === option.value" :size="14" />
      </button>
    </div>
  </span>
</template>
<style>
.bloom-select {
  display: block;
  min-width: 0;
  width: 100%;
}
.bloom-select select[hidden] {
  display: none !important;
}
.bloom-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius, 6px);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  text-align: left;
}
.bloom-select-trigger:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
.bloom-select-menu {
  margin: 0;
  padding: 5px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface, #fff);
  color: var(--text, #222);
  box-shadow: 0 12px 40px #0003;
}
.bloom-select-menu button {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 13px;
  text-align: left;
  border: 0;
  border-radius: 4px;
}
.bloom-select-menu button.highlighted {
  background: color-mix(in srgb, var(--primary), transparent 85%);
}
.bloom-select-menu button[aria-selected='true'] {
  font-weight: 600;
}
</style>
