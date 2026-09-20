<script setup lang="ts">
import { blossoms } from '../lib/blossoms'
defineProps<{ dark: boolean }>()
const woodImage = `${import.meta.env.BASE_URL}images/cherry-wood-clean.png`
const breezePetals = [
  [365, 80, 15, -3],
  [620, 110, 18, -12],
  [490, 260, 16, -7],
  [735, 210, 20, -16],
  [330, 170, 19, -10],
  [675, 320, 17, -2],
  [555, 100, 21, -18],
  [710, 150, 16, -5],
  [450, 310, 20, -14],
  [600, 240, 18, -9],
  [420, 100, 16, -8],
  [680, 180, 19, -4],
  [370, 245, 17, -12],
  [745, 290, 20, -6],
  [510, 160, 18, -15],
  [625, 300, 16, -11],
]
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
    <g class="swaying-tree">
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
    </g>
    <g class="breeze-petals">
      <g
        v-for="([x, y, duration, delay], index) in breezePetals"
        :key="index"
        :transform="`translate(${x} ${y})`"
        class="petal-origin"
      >
        <g
          class="drifting-petal"
          :style="{
            '--drift-duration': `${duration! * 0.75}s`,
            '--drift-delay': `${delay}s`,
            '--drift-x': `${-150 - index * 9}px`,
            '--drift-y': `${95 + index * 8}px`,
          }"
        >
          <g
            class="tumbling-petal"
            :style="{ '--tumble-duration': `${4 + (index % 4)}s` }"
            :class="`tone-${3 + (index % 4)}`"
          >
            <use v-if="index % 4 === 0" href="#cherry-flower" transform="scale(3.4)" />
            <path v-else d="M0 4C-5 0-5-5-2-6Q0-7 1-4Q5-6 5-2C5 1 2 3 0 4Z" fill="currentColor" />
          </g>
        </g>
      </g>
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
.swaying-tree {
  transform-origin: 570px 550px;
  animation: tree-breeze 10s ease-in-out infinite;
  will-change: transform;
}
.drifting-petal {
  opacity: 0;
  animation: petal-drift var(--drift-duration) linear var(--drift-delay) infinite;
}
.tumbling-petal {
  animation: petal-tumble var(--tumble-duration) ease-in-out var(--drift-delay) infinite;
}
@keyframes tree-breeze {
  0%,
  100% {
    transform: rotate(-0.22deg) skewX(-0.1deg);
  }
  38% {
    transform: rotate(0.38deg) skewX(0.14deg);
  }
  65% {
    transform: rotate(0.08deg);
  }
  82% {
    transform: rotate(0.2deg);
  }
}
@keyframes petal-drift {
  0% {
    opacity: 0;
    transform: translate(0, 0);
  }
  12% {
    opacity: 0.7;
  }
  48% {
    transform: translate(calc(var(--drift-x) * 0.48), calc(var(--drift-y) * 0.28));
  }
  78% {
    opacity: 0.55;
  }
  100% {
    opacity: 0;
    transform: translate(var(--drift-x), var(--drift-y));
  }
}
@keyframes petal-tumble {
  0%,
  100% {
    transform: rotate(-25deg) scaleX(1);
  }
  50% {
    transform: rotate(150deg) scaleX(0.45);
  }
}
@media (max-width: 700px) {
  .petal-origin:nth-child(n + 11) {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .swaying-tree {
    animation: none;
    will-change: auto;
  }
  .breeze-petals {
    display: none;
  }
  .drifting-petal,
  .tumbling-petal {
    animation: none;
  }
}
</style>
