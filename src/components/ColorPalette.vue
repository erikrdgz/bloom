<script setup lang="ts">
import { computed } from 'vue'
import { Check, ArrowUpRight } from 'lucide-vue-next'
import { palette, foreground, semanticColors } from '../lib/system'
const props = defineProps<{ primary: string; expanded?: boolean; label?: string }>()
const emit = defineEmits<{ select: []; copy: [value: string] }>()
const shades = computed(() => palette(props.primary))
const tokenName = computed(() => (props.label || 'Primary').toLowerCase())
</script>
<template>
  <section class="panel color-panel">
    <div class="panel-title">
      <div>
        <h2>{{ label || 'Colors' }}</h2>
      </div>
      <button class="icon-button" aria-label="Edit color palette" @click="emit('select')">
        <ArrowUpRight :size="20" />
      </button>
    </div>
    <div class="palette-strip">
      <button
        v-for="shade in shades"
        :key="shade.step"
        :style="{ background: shade.color, color: foreground(shade.color) }"
        :aria-label="`Copy ${tokenName} ${shade.step}: ${shade.color}`"
        @click="emit('copy', shade.color)"
      >
        <Check v-if="shade.step === 500" :size="18" /><span>{{ shade.step }}</span>
      </button>
    </div>
    <div class="palette-meta">
      <span
        ><i :style="{ background: primary }"></i>{{ label || 'Primary' }} /
        {{ primary.toLowerCase() === '#ed6239' ? 'Persimmon' : 'Custom' }}</span
      ><code>{{ primary.toUpperCase() }}</code>
    </div>
    <div v-if="expanded" class="shade-table">
      <div v-for="shade in shades" :key="shade.step">
        <span><i :style="{ background: shade.color }"></i>{{ tokenName }}-{{ shade.step }}</span
        ><button class="code-copy" @click="emit('copy', shade.color)">{{ shade.color }}</button>
      </div>
    </div>
    <div v-if="tokenName === 'primary'" class="semantic-colors">
      <div v-for="color in semanticColors" :key="color.name">
        <span :style="{ background: color.hex }"></span><small>{{ color.name }}</small>
      </div>
    </div>
  </section>
</template>
