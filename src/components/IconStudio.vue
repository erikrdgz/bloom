<script setup lang="ts">
import { computed, inject, nextTick, ref, shallowRef, watch } from 'vue'
import type { ComputedRef } from 'vue'
import type { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { Check, Download, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ColorPicker from './ui/ColorPicker.vue'
import BloomSelect from './ui/BloomSelect.vue'
import { download, defaultSystem, type DesignSystem } from '../lib/system'
import {
  iconCatalog,
  iconFamilies,
  filterIcons,
  iconPaths,
  iconSprite,
  loadIcon,
  type IconFamily,
} from '../lib/icons'
const props = defineProps<{ selected: string[] }>()
const emit = defineEmits<{ update: [icons: string[]] }>()
const system = inject<ComputedRef<DesignSystem>>(
  'bloom-system',
  computed(() => defaultSystem),
)
const size = ref(24)
const customColor = ref<string>()
const color = computed({
  get: () => customColor.value ?? system.value.primary,
  set: (value) => {
    customColor.value = value
  },
})
const search = ref('')
const family = ref<IconFamily | 'all'>('all')
const onlySelected = ref(false)
const selectedIds = computed(() => new Set(props.selected))
const page = ref(1)
const resultSummary = ref<HTMLElement>()
const pageSize = 60
const filtered = computed(() =>
  filterIcons(search.value, family.value, onlySelected.value ? selectedIds.value : undefined),
)
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visible = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)
const definitions = shallowRef(new Map<string, IconDefinition>())
const loading = ref(false)
const loadError = ref('')
const retry = ref(0)
const exporting = ref(false)
const exportError = ref('')
watch(
  [search, family, onlySelected],
  () => {
    page.value = 1
  },
  { flush: 'sync' },
)
watch(
  pages,
  (count) => {
    page.value = Math.min(page.value, count)
  },
  { flush: 'sync' },
)
watch(
  [visible, retry],
  async ([items], _, onCleanup) => {
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    loading.value = true
    loadError.value = ''
    try {
      const loaded = await Promise.all(
        items.map(async (icon) => [icon.id, await loadIcon(icon.id)] as const),
      )
      if (!cancelled) definitions.value = new Map(loaded)
    } catch {
      if (!cancelled) loadError.value = 'Could not load the icons. Please try again.'
    } finally {
      if (!cancelled) loading.value = false
    }
  },
  { immediate: true },
)
function toggle(id: string) {
  emit(
    'update',
    selectedIds.value.has(id)
      ? props.selected.filter((name) => name !== id)
      : [...props.selected, id],
  )
}
async function exportIcons() {
  exporting.value = true
  exportError.value = ''
  try {
    download('bloom-icons.svg', await iconSprite(props.selected), 'image/svg+xml')
  } catch {
    exportError.value = 'Could not export the icons. Please try again.'
  } finally {
    exporting.value = false
  }
}
async function changePage(next: number) {
  page.value = Math.max(1, Math.min(pages.value, next))
  await nextTick()
  resultSummary.value?.focus({ preventScroll: true })
  resultSummary.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
}
function resetFilters() {
  search.value = ''
  family.value = 'all'
  onlySelected.value = false
}
</script>
<template>
  <section
    class="panel icon-collection"
    data-page-cascade
    aria-label="Font Awesome icon collection"
  >
    <div class="panel-title">
      <div>
        <h2>Icon collection</h2>
        <p>{{ iconCatalog.length.toLocaleString() }} free icons</p>
      </div>
      <span class="pill">{{ selected.length }} selected</span>
    </div>
    <div class="icon-toolbar">
      <label class="icon-search"
        ><Search :size="17" aria-hidden="true" /><input
          v-model="search"
          type="search"
          placeholder="Search icons…"
          aria-label="Search icons"
      /></label>
      <label class="icon-family"
        >Style<BloomSelect v-model="family"
          ><option value="all">All styles</option>
          <option v-for="style in iconFamilies" :key="style.id" :value="style.id">
            {{ style.label }}
          </option></BloomSelect
        ></label
      >
      <button
        class="button icon-selected-filter"
        :aria-pressed="onlySelected"
        @click="onlySelected = !onlySelected"
      >
        <Check :size="15" aria-hidden="true" />Selected only
      </button>
    </div>
    <div class="icon-settings">
      <label
        >Preview size <input v-model.number="size" type="range" min="16" max="48" /><output
          >{{ size }}px</output
        ></label
      >
      <ColorPicker v-model="color" label="Preview color" />
    </div>
    <div ref="resultSummary" class="icon-results" role="status" aria-live="polite" tabindex="-1">
      {{ filtered.length.toLocaleString() }} {{ filtered.length === 1 ? 'icon' : 'icons'
      }}{{ filtered.length ? ` · Page ${page} of ${pages}` : '' }}
    </div>
    <div v-if="loadError" class="icon-empty" role="alert">
      <p>{{ loadError }}</p>
      <button class="button" @click="retry++">Try again</button>
    </div>
    <div v-else-if="!filtered.length" class="icon-empty">
      <h3>{{ onlySelected ? 'No selected icons match.' : 'No icons found.' }}</h3>
      <p>Try another name or explore all styles.</p>
      <button class="button" @click="resetFilters">Reset filters</button>
    </div>
    <div v-else class="icon-grid" :aria-busy="loading" aria-label="Icon results">
      <button
        data-system-editor
        v-for="icon in visible"
        :key="icon.id"
        :aria-label="`${icon.name.replaceAll('-', ' ')}, ${icon.family}`"
        :aria-pressed="selectedIds.has(icon.id)"
        :class="{ chosen: selectedIds.has(icon.id) }"
        @click="toggle(icon.id)"
      >
        <Check
          v-if="selectedIds.has(icon.id)"
          class="selection-check"
          :size="14"
          aria-hidden="true"
        />
        <svg
          v-if="definitions.has(icon.id)"
          :width="size"
          :height="size"
          :viewBox="`0 0 ${definitions.get(icon.id)!.icon[0]} ${definitions.get(icon.id)!.icon[1]}`"
          :fill="color"
          aria-hidden="true"
        >
          <path v-for="path in iconPaths(definitions.get(icon.id)!)" :key="path" :d="path" />
        </svg>
        <span
          v-else
          class="icon-placeholder"
          :style="{ width: size + 'px', height: size + 'px' }"
          aria-hidden="true"
        />
        <span class="icon-name">{{ icon.name }}</span
        ><small>{{ icon.family }}</small>
      </button>
    </div>
    <nav v-if="pages > 1" class="icon-pagination" aria-label="Icon pages">
      <button class="button" :disabled="page === 1" @click="changePage(page - 1)">
        <ChevronLeft :size="16" />Previous</button
      ><span>{{ page }} / {{ pages }}</span
      ><button class="button" :disabled="page === pages" @click="changePage(page + 1)">
        Next<ChevronRight :size="16" />
      </button>
    </nav>
    <div class="icon-footer">
      <p>
        Font Awesome Free
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer"
          >CC BY 4.0</a
        ><br /><small
          >Exports every selected icon across all styles. Size and color are preview
          settings.</small
        >
      </p>
      <button class="button accent" :disabled="!selected.length || exporting" @click="exportIcons">
        <Download :size="16" />{{ exporting ? 'Exporting…' : `Export ${selected.length} icons` }}
      </button>
    </div>
    <p v-if="exportError" class="icon-results" role="alert">{{ exportError }}</p>
  </section>
</template>
<style scoped>
.icon-collection .panel-title p {
  color: var(--muted);
  font-size: 12px;
  margin: 8px 0 0;
}
.icon-toolbar {
  display: flex;
  align-items: end;
  gap: 12px;
  padding: 0 24px 24px;
}
.icon-search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 0 14px;
  color: var(--muted);
  background: var(--surface);
}
.icon-search:focus-within {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.icon-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 13px;
}
.icon-family {
  display: grid;
  gap: 5px;
  min-width: 150px;
  color: var(--muted);
  font-size: 12px;
}
.icon-selected-filter {
  min-height: 44px;
}
.icon-selected-filter[aria-pressed='true'] {
  background: var(--primary);
  color: var(--on-primary);
}
.icon-settings {
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
}
.icon-settings output {
  min-width: 36px;
  font-variant-numeric: tabular-nums;
}
.icon-results {
  scroll-margin-top: calc(var(--topbar-h, 76px) + 24px);
  padding: 0 24px 18px;
  color: var(--muted);
  font-size: 12px;
}
.icon-collection .icon-grid {
  grid-template-columns: repeat(auto-fill, minmax(116px, 1fr));
  gap: 10px;
}
.icon-collection .icon-grid button {
  height: 132px;
  min-width: 0;
  padding: 12px 8px;
  gap: 10px;
  color: var(--text);
  transition:
    background var(--duration-fast, 120ms),
    border-color var(--duration-fast, 120ms);
}
.icon-grid button:hover {
  border-color: var(--text);
}
.icon-grid button.chosen {
  border-color: var(--focus-ring);
}
.icon-grid .selection-check {
  color: var(--text);
}
.icon-grid button:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
.icon-grid .icon-name {
  width: 100%;
  color: var(--text);
  overflow-wrap: anywhere;
  line-height: 1.3;
}
.icon-grid small {
  color: var(--muted);
  font-size: 10px;
  text-transform: capitalize;
}
.icon-grid svg {
  flex-shrink: 0;
}
.icon-placeholder {
  display: block;
  border-radius: 6px;
  background: var(--soft);
}
.icon-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 0 24px 24px;
  font-size: 12px;
  color: var(--muted);
}
.icon-empty {
  text-align: center;
  padding: 48px 24px;
}
.icon-empty p {
  color: var(--muted);
  font-size: 13px;
}
.icon-empty .button {
  margin: 16px auto 0;
}
@media (max-width: 700px) {
  .icon-toolbar {
    flex-wrap: wrap;
    padding: 0 16px 20px;
  }
  .icon-search {
    flex-basis: 100%;
  }
  .icon-family {
    flex: 1;
    min-width: 120px;
  }
  .icon-collection .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    padding: 0 16px 20px;
  }
  .icon-settings,
  .icon-results {
    padding-left: 16px;
    padding-right: 16px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .icon-collection .icon-grid button {
    transition: none;
  }
}
</style>
