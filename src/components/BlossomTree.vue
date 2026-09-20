<script setup lang="ts">
import { blossoms } from '../lib/blossoms'
defineProps<{ dark: boolean }>()
const woodImage = `${import.meta.env.BASE_URL}images/cherry-wood-clean.png`
const rear = blossoms.filter((flower) => flower.rear)
const front = blossoms.filter((flower) => !flower.rear)
</script>
<template>
  <svg
    class="vector-tree"
    :class="{ night: dark }"
    viewBox="0 0 800 560"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <g id="cherry-flower">
        <path
          d="M0 .1C-.35-.2-.72-.58-.48-.92Q-.25-1.14 0-.82Q.27-1.14.49-.88C.72-.53.32-.18 0 .1Z"
          fill="currentColor"
        />
        <path
          d="M0 .1C-.35-.2-.72-.58-.48-.92Q-.25-1.14 0-.82Q.27-1.14.49-.88C.72-.53.32-.18 0 .1Z"
          fill="currentColor"
          transform="rotate(72)"
        />
        <path
          d="M0 .1C-.35-.2-.72-.58-.48-.92Q-.25-1.14 0-.82Q.27-1.14.49-.88C.72-.53.32-.18 0 .1Z"
          fill="currentColor"
          transform="rotate(144)"
        />
        <path
          d="M0 .1C-.35-.2-.72-.58-.48-.92Q-.25-1.14 0-.82Q.27-1.14.49-.88C.72-.53.32-.18 0 .1Z"
          fill="currentColor"
          transform="rotate(216)"
        />
        <path
          d="M0 .1C-.35-.2-.72-.58-.48-.92Q-.25-1.14 0-.82Q.27-1.14.49-.88C.72-.53.32-.18 0 .1Z"
          fill="currentColor"
          transform="rotate(288)"
        />
        <path
          d="M0-.45V.4M-.4-.15L.38.15M-.25.34L.25-.34"
          stroke="var(--flower-center)"
          stroke-width=".07"
          opacity=".8"
        />
        <circle r=".13" fill="var(--flower-center)" />
      </g>
      <g id="cherry-bud">
        <ellipse rx=".5" ry=".8" fill="currentColor" />
        <path d="M-.3.5L0 .9L.3.5" fill="var(--flower-shadow)" />
      </g>
    </defs>
    <g class="rear-blossoms">
      <use
        v-for="flower in rear"
        :key="flower.id"
        :href="flower.bud ? '#cherry-bud' : '#cherry-flower'"
        :class="`tone-${Math.max(0, flower.tone - 1)}`"
        :transform="`translate(${flower.x} ${flower.y}) rotate(${flower.angle}) scale(${flower.size} ${flower.size * flower.aspect})`"
      />
    </g>
    <image
      class="wood-photo"
      :href="woodImage"
      x="0"
      y="0"
      width="800"
      height="560"
      preserveAspectRatio="none"
    />
    <g class="front-blossoms">
      <use
        v-for="flower in front"
        :key="flower.id"
        :href="flower.bud ? '#cherry-bud' : '#cherry-flower'"
        :class="`tone-${flower.tone}`"
        :transform="`translate(${flower.x} ${flower.y}) rotate(${flower.angle}) scale(${flower.size} ${flower.size * flower.aspect})`"
      />
    </g>
  </svg>
</template>
<style scoped>
.vector-tree {
  --flower-shadow: color-mix(in srgb, var(--primary), #54323e 38%);
  --flower-center: color-mix(in srgb, var(--primary), #754253 52%);
  overflow: visible;
}
.tone-0 {
  color: var(--flower-shadow);
}
.tone-1 {
  color: color-mix(in srgb, var(--primary), #815063 23%);
}
.tone-2 {
  color: var(--primary);
}
.tone-3 {
  color: color-mix(in srgb, var(--primary), #fff3ed 18%);
}
.tone-4 {
  color: color-mix(in srgb, var(--primary), #fff3ed 34%);
}
.tone-5 {
  color: color-mix(in srgb, var(--primary), #fff3ed 52%);
}
.tone-6 {
  color: color-mix(in srgb, var(--primary), #fff8f2 70%);
}
.wood-photo {
  opacity: 1;
}
</style>
