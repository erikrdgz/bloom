<script setup lang="ts">
import { ref } from 'vue'
import {
  faHeart,
  faStar,
  faBolt,
  faMoon,
  faSun,
  faCheck,
  faArrowRight,
  faPlus,
  faBell,
  faHouse,
  faGear,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { Check, Download } from 'lucide-vue-next'
import { download } from '../lib/system'
const props = defineProps<{ selected: string[] }>()
const emit = defineEmits<{ update: [icons: string[]] }>()
const icons = [
  faHeart,
  faStar,
  faBolt,
  faMoon,
  faSun,
  faCheck,
  faArrowRight,
  faPlus,
  faBell,
  faHouse,
  faGear,
  faUser,
]
const size = ref(24)
const color = ref('#ed6239')
function toggle(name: string) {
  emit(
    'update',
    props.selected.includes(name)
      ? props.selected.filter((n) => n !== name)
      : [...props.selected, name],
  )
}
function exportIcons() {
  const symbols = icons
    .filter((i) => props.selected.includes(i.iconName))
    .map(
      (i) =>
        `<symbol id="${i.iconName}" viewBox="0 0 ${i.icon[0]} ${i.icon[1]}">${(Array.isArray(i.icon[4]) ? i.icon[4] : [i.icon[4]]).map((d) => `<path d="${d}"/>`).join('')}</symbol>`,
    )
    .join('\n')
  download(
    'bloom-icons.svg',
    `<!-- Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com\nLicense: CC BY 4.0 (icons) https://creativecommons.org/licenses/by/4.0/ -->\n<svg xmlns="http://www.w3.org/2000/svg"><defs>\n${symbols}\n</defs></svg>`,
    'image/svg+xml',
  )
}
</script>
<template>
  <section class="panel">
    <div class="panel-title">
      <div>
        <h2>Icon collection</h2>
      </div>
      <span class="pill">{{ selected.length }} selected</span>
    </div>
    <div class="icon-settings">
      <label
        >Preview size <input v-model.number="size" type="range" min="16" max="48" />{{
          size
        }}px</label
      ><label>Preview color <input v-model="color" type="color" /></label>
    </div>
    <div class="icon-grid">
      <button
        v-for="icon in icons"
        :key="icon.iconName"
        :aria-pressed="selected.includes(icon.iconName)"
        :class="{ chosen: selected.includes(icon.iconName) }"
        @click="toggle(icon.iconName)"
      >
        <Check v-if="selected.includes(icon.iconName)" class="selection-check" :size="14" /><svg
          :width="size"
          :height="size"
          :viewBox="`0 0 ${icon.icon[0]} ${icon.icon[1]}`"
          :fill="color"
          aria-hidden="true"
        >
          <path
            v-for="path in Array.isArray(icon.icon[4]) ? icon.icon[4] : [icon.icon[4]]"
            :key="path"
            :d="path"
          /></svg
        ><span>{{ icon.iconName }}</span>
      </button>
    </div>
    <div class="icon-footer">
      <p>
        Font Awesome Free ·
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer"
          >CC BY 4.0</a
        ><br /><small>Curate a reusable SVG sprite. Size and color are preview settings.</small>
      </p>
      <button class="button accent" :disabled="!selected.length" @click="exportIcons">
        <Download :size="16" />Export sprite
      </button>
    </div>
  </section>
</template>
