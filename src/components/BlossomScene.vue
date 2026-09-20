<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import BlossomTree from './BlossomTree.vue'
defineProps<{ primary: string; dark: boolean; name: string }>()
const emit = defineEmits<{ explore: []; color: [value: string] }>()
</script>
<template>
  <section class="blossom-hero" :class="{ moonlit: dark }">
    <div class="blossom-scene" aria-hidden="true">
      <span class="moon-halo"></span><span class="moon-disc"></span>
      <BlossomTree class="blossom-tree" :dark="dark" />
    </div>
    <div class="blossom-copy">
      <span class="garden-label">FROM A SEED TO A SYSTEM</span>
      <h2>Good systems<br /><em>keep growing.</em></h2>
      <p>
        Begin with a color, find your voice in type.<br />Let every component grow from the same
        roots.
      </p>
      <button class="garden-link" @click="emit('explore')">
        Explore the library <ArrowRight :size="17" />
      </button>
    </div>
    <div class="garden-caption">
      <span>{{ dark ? 'DARK APPEARANCE' : 'LIGHT APPEARANCE' }}</span
      ><label class="blossom-color"
        ><input
          type="color"
          :value="primary"
          aria-label="Blossom and brand color"
          @input="emit('color', ($event.target as HTMLInputElement).value)"
        /><span>Blossom tint</span><code>{{ primary.toUpperCase() }}</code></label
      >
    </div>
  </section>
</template>
<style scoped>
.blossom-hero {
  position: relative;
  isolation: isolate;
  min-height: 395px;
  background: #edf0f4;
  border: 1px solid #d9e0e8;
  border-radius: 3px;
  overflow: hidden;
  color: #303b4b;
}
.blossom-scene {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(ellipse at 77% 50%, #fafbfc 0, transparent 60%);
}
.blossom-copy {
  position: relative;
  padding: 45px 42px 78px;
  width: 54%;
}
.garden-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1.8px;
  color: #6d7888;
}
.blossom-copy h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 400;
  letter-spacing: -1.5px;
  font-size: clamp(43px, 4.4vw, 66px);
  line-height: 1.02;
  margin: 28px 0 20px;
}
.blossom-copy h2 em {
  font-weight: 400;
  color: #748195;
}
.blossom-copy p {
  font-size: 13px;
  line-height: 1.85;
  color: #657386;
  margin: 0;
}
.garden-link {
  display: flex;
  align-items: center;
  gap: 28px;
  background: transparent;
  padding: 8px 0;
  border-bottom: 1px solid #929eae;
  font-size: 12px;
  margin-top: 23px;
}
.garden-link:hover {
  color: var(--accent);
}
.blossom-tree {
  position: absolute;
  width: 74%;
  height: 112%;
  object-fit: contain;
  right: -8%;
  bottom: -8%;
  transform-origin: 80% 100%;
  transition: filter 0.5s ease;
  opacity: 0.96;
}
.moon-disc {
  position: absolute;
  right: 15%;
  top: 13%;
  width: 190px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #f9f6eb;
  opacity: 0.65;
}
.moon-halo {
  position: absolute;
  inset: 0;
  opacity: 0;
}
.garden-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #c7d0de66;
  background: #edf0f475;
  backdrop-filter: blur(8px);
}
.garden-caption > span {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8px;
  letter-spacing: 1.5px;
  color: #748195;
}
.blossom-color {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  cursor: pointer;
  color: #596b82;
}
.blossom-color input {
  width: 20px;
  height: 20px;
  border: none;
  padding: 0;
  background: none;
  border-radius: 50%;
  overflow: hidden;
}
.blossom-color input::-webkit-color-swatch-wrapper {
  padding: 0;
}
.blossom-color input::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}
.blossom-color code {
  font-size: 9px;
  color: inherit;
}
.moonlit {
  background: #171f2a;
  border-color: #313b47;
  color: #eef0e9;
}
.moonlit .blossom-scene {
  background: radial-gradient(ellipse at 76% 35%, #48566b45 0, transparent 62%);
}
.moonlit .garden-label {
  color: #9aabba;
}
.moonlit .blossom-copy h2 em {
  color: #a3afa8;
}
.moonlit .blossom-copy p {
  color: #a6b0b9;
}
.moonlit .garden-link {
  border-color: #75838c;
}
.moonlit .moon-disc {
  background: radial-gradient(circle at 36% 30%, #fffdf0, #e0e6e8 76%, #ccd7df);
  opacity: 0.95;
  box-shadow:
    0 0 45px #dce7f025,
    0 0 100px #dce7f019;
}
.moonlit .moon-halo {
  opacity: 1;
  background: radial-gradient(ellipse at 78% 32%, #c4dbe412, transparent 55%);
}
.moonlit .blossom-tree {
  opacity: 1;
}
.moonlit .garden-caption {
  background: #18212b66;
  border-color: #64717a22;
}
.moonlit .garden-caption > span,
.moonlit .blossom-color {
  color: #a8b6bd;
}
@media (min-width: 1500px) {
  .blossom-hero {
    min-height: 440px;
  }
  .blossom-copy {
    padding-top: 58px;
  }
  .blossom-tree {
    width: 72%;
    right: -5%;
    height: 115%;
  }
  .moon-disc {
    width: 220px;
  }
}
@media (max-width: 1100px) {
  .blossom-copy {
    padding: 36px 28px 80px;
    width: 61%;
  }
  .blossom-copy h2 {
    font-size: 48px;
  }
  .blossom-tree {
    width: 82%;
    right: -19%;
  }
  .moon-disc {
    right: 10%;
    width: 160px;
  }
  .garden-caption > span {
    font-size: 7px;
    letter-spacing: 1px;
  }
}
@media (max-width: 700px) {
  .blossom-hero {
    min-height: 545px;
  }
  .blossom-copy {
    padding: 28px 25px 245px;
    width: 100%;
  }
  .garden-label {
    font-size: 8px;
    letter-spacing: 1.3px;
  }
  .blossom-copy h2 {
    font-size: 48px;
    margin: 22px 0 17px;
  }
  .blossom-copy p {
    font-size: 12px;
    max-width: 170px;
  }
  .garden-link {
    gap: 15px;
    margin-top: 18px;
    font-size: 11px;
  }
  .blossom-tree {
    width: 100%;
    height: 64%;
    right: -12%;
    bottom: 1%;
  }
  .moon-disc {
    width: 140px;
    top: 52%;
    right: 7%;
  }
  .moonlit .blossom-scene {
    background: radial-gradient(ellipse at 85% 65%, #64718a30, transparent 62%);
  }
  .garden-caption {
    padding: 13px 16px;
    gap: 8px;
  }
  .garden-caption > span {
    font-size: 7px;
    max-width: 115px;
    line-height: 1.6;
  }
  .blossom-color {
    font-size: 9px;
    gap: 6px;
  }
  .blossom-color code {
    font-size: 8px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .blossom-tree {
    transition: none;
  }
}
</style>
