<script setup lang="ts">
import { useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
defineProps<{ title: string; summary?: string; open: boolean }>()
defineEmits<{ toggle: [] }>()
const id = useId()
</script>
<template>
  <section class="property-group">
    <button
      :id="id + '-trigger'"
      class="property-group-trigger"
      :aria-expanded="open"
      :aria-controls="id"
      @click="$emit('toggle')"
    >
      <span>{{ title }}</span
      ><small v-if="summary">{{ summary }}</small
      ><ChevronDown :size="14" :class="{ expanded: open }" aria-hidden="true" />
    </button>
    <div
      :id="id"
      class="property-group-disclosure"
      :class="{ expanded: open }"
      :inert="!open"
      :aria-hidden="!open"
      role="region"
      :aria-labelledby="id + '-trigger'"
    >
      <div class="property-group-clip">
        <div class="property-group-content"><slot /></div>
      </div>
    </div>
  </section>
</template>
<style scoped>
.property-group {
  border-top: 1px solid var(--border);
}
.property-group-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 0;
  border: 0;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-size: 11px;
}
.property-group-trigger > span {
  flex-shrink: 0;
  font-weight: 500;
}
.property-group-trigger small {
  margin-left: auto;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--muted);
  font-size: 9px;
}
.property-group-trigger svg {
  margin-left: auto;
  flex-shrink: 0;
}
.property-group-trigger small + svg {
  margin-left: 0;
}
.property-group-trigger svg.expanded {
  transform: rotate(180deg);
}
.property-group-trigger:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: -2px;
}
.property-group-disclosure {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  visibility: hidden;
  transition:
    grid-template-rows var(--duration-standard, 200ms) ease,
    opacity var(--duration-fast, 120ms) ease,
    visibility var(--duration-standard, 200ms);
}
.property-group-disclosure.expanded {
  grid-template-rows: 1fr;
  opacity: 1;
  visibility: visible;
}
.property-group-clip {
  min-height: 0;
  overflow: hidden;
}
.property-group-trigger svg {
  transition: transform var(--duration-standard, 200ms) ease;
}
@media (prefers-reduced-motion: reduce) {
  .property-group-disclosure,
  .property-group-trigger svg {
    transition: none;
  }
}
.property-group-content {
  padding: 2px 0 16px;
}
</style>
