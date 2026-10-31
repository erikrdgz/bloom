<script setup lang="ts">
import { useId } from 'vue'
const flowerId = `blossom-study-${useId()}`
</script>

<template>
  <!-- A small supporting drawing; the signature tree remains in BlossomTree.vue. -->
  <svg class="blossom-study" viewBox="0 0 220 260" fill="none" aria-hidden="true">
    <defs>
      <g :id="flowerId">
        <g v-for="angle in [0, 72, 144, 216, 288]" :key="angle" :transform="`rotate(${angle})`">
          <path
            d="M0 2C-8-4-20-14-14-23C-10-30-3-29 0-23C4-30 12-29 15-22C19-13 8-4 0 2Z"
            fill="var(--primary)"
            stroke="var(--study-ink)"
            stroke-width="0.75"
          />
          <path
            d="M-2-4Q-12-15-10-22M1-6Q8-13 10-21M0-7V-19"
            stroke="var(--study-ink)"
            stroke-width="0.55"
            opacity="0.45"
          />
        </g>
        <g
          v-for="angle in [0, 45, 90, 135, 180, 225, 270, 315]"
          :key="angle"
          :transform="`rotate(${angle})`"
          stroke="var(--study-ink)"
        >
          <path d="M0 0L1-11" stroke-width="0.6" />
          <circle cx="1" cy="-11" r="1.1" fill="var(--study-ink)" stroke="none" />
        </g>
        <circle r="3" fill="var(--study-ink)" />
      </g>
    </defs>
    <circle cx="118" cy="124" r="76" stroke="var(--secondary)" stroke-width="0.6" opacity="0.35" />
    <path
      d="M36 229C73 193 91 153 107 110C118 83 140 63 168 45M78 177Q127 160 165 133M98 134Q80 102 71 79M119 87Q119 55 108 36"
      stroke="var(--study-ink)"
      stroke-width="2.6"
      stroke-linecap="round"
    />
    <path
      d="M46 223Q86 184 107 117M84 175Q124 164 149 144"
      stroke="var(--secondary)"
      stroke-width="0.65"
    />
    <use :href="`#${flowerId}`" transform="translate(108 112) rotate(-14) scale(1.15)" />
    <use :href="`#${flowerId}`" transform="translate(159 61) rotate(21) scale(.72)" />
    <use :href="`#${flowerId}`" transform="translate(159 139) rotate(-32) scale(.82)" />
    <use :href="`#${flowerId}`" transform="translate(72 83) rotate(8) scale(.58)" />
    <path
      d="M108 39C96 27 103 17 109 21C119 18 120 33 108 39Z"
      fill="var(--primary)"
      stroke="var(--study-ink)"
      stroke-width="0.8"
    />
    <path
      d="M176 213C160 211 158 198 164 196C167 189 179 199 176 213Z"
      fill="var(--primary)"
      stroke="var(--study-ink)"
      stroke-width="0.7"
    />
    <path
      d="M45 142C34 138 36 129 41 130C48 125 51 137 45 142Z"
      fill="var(--primary)"
      opacity="0.75"
    />
  </svg>
</template>

<style scoped>
.blossom-study {
  --study-ink: color-mix(in srgb, var(--secondary), var(--text) 35%);
}
</style>
