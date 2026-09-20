<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowRight, Check } from 'lucide-vue-next'
import { fontFamily, loadFont } from '../lib/fonts'
import {
  foreground,
  neutralPalettes,
  palette,
  systemShadow,
  systemTypeStyles,
  type DesignSystem,
} from '../lib/system'
const props = defineProps<{ system: DesignSystem }>()
const dark = ref(false)
const pressed = ref(false)
const surface = computed(() => neutralPalettes[props.system.neutral][dark.value ? 'dark' : 'light'])
const styles = computed(() => ({
  '--preview-bg': surface.value.background,
  '--preview-surface': surface.value.surface,
  '--preview-text': surface.value.text,
  '--preview-border': surface.value.border,
  '--preview-primary': props.system.primary,
  '--preview-on-primary': foreground(props.system.primary),
  '--preview-radius': `${props.system.radius}px`,
  '--preview-space': `${props.system.spacing}px`,
  '--preview-shadow': systemShadow(props.system),
  fontFamily: fontFamily(props.system.font),
  fontSize: `${props.system.baseSize}px`,
}))
const heading = computed(() => systemTypeStyles(props.system)[2]!)
watch(
  () => [props.system.font, props.system.headingFont],
  () => {
    loadFont(props.system.font)
    loadFont(props.system.headingFont)
  },
  { immediate: true },
)
</script>
<template>
  <aside class="system-preview">
    <header>
      <strong>Live preview</strong>
      <div class="preview-modes">
        <button type="button" :aria-pressed="!dark" @click="dark = false">Light</button
        ><button type="button" :aria-pressed="dark" @click="dark = true">Dark</button>
      </div>
    </header>
    <div class="preview-canvas" :style="styles">
      <div class="preview-nav">
        <strong>{{ system.name || 'Untitled system' }}</strong
        ><span :style="{ color: system.secondary }">Library</span>
      </div>
      <div class="preview-product-card">
        <span class="preview-kicker">{{
          system.description || 'Your project, built with these tokens.'
        }}</span>
        <h3 :style="{ fontFamily: fontFamily(system.headingFont), fontSize: `${heading.size}px` }">
          A new collection
        </h3>
        <p>Keep your projects organized and make room for the next one.</p>
        <label>Collection name<input placeholder="Website components" /></label
        ><button type="button" class="preview-cta" @click="pressed = !pressed">
          {{ pressed ? 'Collection added' : 'Add collection'
          }}<Check v-if="pressed" :size="16" /><ArrowRight v-else :size="16" />
        </button>
        <div
          class="preview-tag"
          :style="{ color: foreground(system.secondary), background: system.secondary }"
        >
          {{ system.icons.length }} icons included
        </div>
      </div>
      <div class="preview-palette">
        <span
          v-for="shade in palette(system.primary)"
          :key="shade.step"
          :style="{ background: shade.color }"
          :title="shade.color"
        ></span>
      </div>
      <div class="preview-caption">
        <span>{{ system.headingFont }} / {{ system.font }}</span
        ><span>{{ system.spacing }}px grid · {{ system.radius }}px radius</span>
      </div>
    </div>
  </aside>
</template>
