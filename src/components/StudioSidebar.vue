<script setup lang="ts">
import BloomSelect from './ui/BloomSelect.vue'
import BloomMark from './BloomMark.vue'
import {
  Activity,
  LayoutGrid,
  Palette,
  Type,
  Ruler,
  Component,
  Shapes,
  Plus,
  ArrowUpRight,
  Upload,
  X,
} from 'lucide-vue-next'
defineProps<{
  active: string
  name: string
  open: boolean
  projects: { id: string; system: { name: string } }[]
  activeId: string
}>()
defineEmits<{
  navigate: [section: string]
  create: []
  import: []
  close: []
  select: [id: string]
}>()
const sections = [
  { name: 'Overview', icon: LayoutGrid },
  { name: 'Colors', icon: Palette },
  { name: 'Typography', icon: Type },
  { name: 'Spacing & shape', icon: Ruler },
  { name: 'Components', icon: Component },
  { name: 'Motion', icon: Activity },
  { name: 'Icon set', icon: Shapes },
]
</script>
<template>
  <aside class="sidebar" :class="{ open }">
    <a class="wordmark" href="#" @click.prevent="$emit('navigate', 'Overview')"
      ><BloomMark :size="30" />bloom<span class="brand-period">.</span></a
    >
    <button class="icon-button close-nav" aria-label="Close navigation" @click="$emit('close')">
      <X :size="20" />
    </button>
    <div class="workspace-label">WORKSPACE</div>
    <label class="workspace-picker"
      ><span>Saved systems</span
      ><BloomSelect
        :value="activeId"
        @change="$emit('select', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.system.name }}{{ project.id === 'bloom-default' ? ' · Original' : '' }}
        </option>
      </BloomSelect></label
    >
    <div class="nav-label">LIBRARY</div>
    <nav aria-label="Library sections">
      <button
        v-for="item in sections"
        :key="item.name"
        :class="{ active: active === item.name }"
        :aria-current="active === item.name ? 'page' : undefined"
        @click="$emit('navigate', item.name)"
      >
        <component :is="item.icon" :size="18" />{{ item.name }}
      </button>
    </nav>
    <div class="sidebar-divider"></div>
    <button class="sidebar-action" @click="$emit('create')">
      <Plus :size="18" />Create a system
    </button>
    <button class="sidebar-action" @click="$emit('import')">
      <Upload :size="18" />Import system
    </button>
    <div class="sidebar-bottom">
      <a
        class="sidebar-license"
        href="https://opensource.org/license/mit"
        target="_blank"
        rel="noreferrer"
        >MIT license</a
      >
      <div class="sidebar-footer"><span>Bloom</span><small>0.1.0</small></div>
    </div>
  </aside>
</template>
