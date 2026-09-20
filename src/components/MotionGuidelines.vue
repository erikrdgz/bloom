<script setup lang="ts">
import BloomSelect from './ui/BloomSelect.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import { durations, easings, motionDeclarations, reducedMotionCSS } from '../lib/motion'
import { useReducedMotion } from '../composables/useReducedMotion'
import LibraryButton from './ui/LibraryButton.vue'
import LibrarySwitch from './ui/LibrarySwitch.vue'
const props = defineProps<{ profile: 'calm' | 'standard' | 'snappy' }>()
const timingScale = computed(() =>
  durations.map((token) => ({
    ...token,
    value: Math.round(token.value * { calm: 1.4, standard: 1, snappy: 0.7 }[props.profile]),
  })),
)
const emit = defineEmits<{
  copy: [value: string]
  profile: [value: 'calm' | 'standard' | 'snappy']
}>()
const duration = ref(Math.round(200 * { calm: 1.4, standard: 1, snappy: 0.7 }[props.profile]))
watch(
  () => props.profile,
  (profile) => {
    duration.value = Math.round(200 * { calm: 1.4, standard: 1, snappy: 0.7 }[profile])
  },
)
const easing = ref<string>(easings[0].value)
const simulateReduced = ref(false)
const systemReduced = useReducedMotion()
const reduced = computed(() => simulateReduced.value || systemReduced.value)
const run = ref(1)
const playback = ref(3)
const effect = ref('Move')
watch([duration, easing, playback, effect], () => replay())
const track = ref<HTMLElement>()
const travel = ref(200)
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(() => {
    travel.value = Math.max(0, (track.value?.clientWidth ?? 300) - 100)
  })
  if (track.value) observer.observe(track.value)
})
onUnmounted(() => observer?.disconnect())
const style = computed(() => ({
  '--demo-duration': `${reduced.value ? 0 : duration.value * playback.value}ms`,
  '--demo-easing': easing.value,
  '--travel': `${travel.value}px`,
}))
const snippet = computed(
  () =>
    `.surface {\n  transition: opacity var(--duration-standard) var(--ease-standard),\n              transform var(--duration-standard) var(--ease-standard);\n}\n\n${reducedMotionCSS}`,
)
const tokens = computed(
  () => `:root {\n${motionDeclarations(props.profile)}\n}\n\n${reducedMotionCSS}`,
)
function replay() {
  run.value++
}
</script>
<template>
  <div class="motion-page">
    <div class="editor-toolbar">
      <label
        >System motion<BloomSelect
          :value="profile"
          @change="
            emit(
              'profile',
              ($event.target as HTMLSelectElement).value as 'calm' | 'standard' | 'snappy',
            )
          "
        >
          <option value="snappy">Snappy</option>
          <option value="standard">Standard</option>
          <option value="calm">Calm</option>
        </BloomSelect></label
      ><span>Applies to Bloom and your exported tokens.</span>
    </div>
    <section class="motion-lab">
      <header>
        <div>
          <h2>Transition preview</h2>
          <p>Compare timing and easing before applying them to a component.</p>
        </div>
        <LibraryButton variant="secondary" @click="replay"
          ><RotateCcw :size="15" />Replay</LibraryButton
        >
      </header>
      <div class="motion-controls">
        <label
          >Pattern<BloomSelect v-model="effect" @change="replay">
            <option>Enter</option>
            <option>Exit</option>
            <option>Move</option>
          </BloomSelect></label
        ><label
          >Duration<BloomSelect v-model.number="duration">
            <option v-for="token in timingScale" :key="token.name" :value="token.value">
              {{ token.value }} ms · {{ token.name }}
            </option>
          </BloomSelect></label
        ><label
          >Easing<BloomSelect v-model="easing">
            <option v-for="token in easings" :key="token.name" :value="token.value">
              {{ token.name }}
            </option>
          </BloomSelect></label
        >
      </div>
      <div class="motion-playback">
        <label
          >Playback speed<BloomSelect v-model.number="playback"
            ><option :value="1">Actual speed</option>
            <option :value="3">Slow · ⅓ speed</option>
            <option :value="6">Study · ⅙ speed</option></BloomSelect
          ></label
        >
        <p>
          {{ duration }} ms token · {{ duration * playback }} ms playback. Replay to compare the
          full journey.
        </p>
      </div>
      <div class="motion-stage" :style="style" :class="{ 'motion-reduced': reduced }">
        <div ref="track" class="motion-track">
          <span class="motion-guide start">Start</span><span class="motion-guide end">End</span>
          <div
            :key="`${run}-${effect}-${reduced}`"
            class="motion-surface"
            :class="{
              playing: run > 0,
              entering: effect === 'Enter',
              exiting: effect === 'Exit',
              moving: effect === 'Move',
            }"
          >
            <span class="motion-surface-line"></span><span class="motion-surface-line short"></span
            ><span class="motion-surface-button"></span>
          </div>
        </div>
      </div>
      <div class="motion-preference">
        <LibrarySwitch v-model="simulateReduced" label="Preview reduced motion" /><span
          role="status"
          >{{
            systemReduced
              ? 'Your device requests reduced motion.'
              : reduced
                ? 'Movement is disabled in this preview.'
                : 'Uses your device’s motion preference.'
          }}</span
        >
      </div>
    </section>
    <section class="motion-reference">
      <header>
        <h2>Timing scale</h2>
        <p>
          Use these defaults consistently. Choose the shortest duration that makes the state change
          readable.
        </p>
      </header>
      <div class="reference-table-wrap">
        <table class="reference-table">
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Duration</th>
              <th scope="col">Use</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="token in timingScale" :key="token.name">
              <th scope="row">
                <code>--duration-{{ token.name }}</code>
              </th>
              <td>{{ token.value }} ms</td>
              <td>{{ token.use }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="motion-reference">
      <header>
        <h2>Easing</h2>
        <p>
          Entry settles quickly. Exit accelerates away. Avoid adding bounce to routine controls.
        </p>
      </header>
      <div class="easing-list">
        <div v-for="token in easings" :key="token.name">
          <strong>{{ token.name }}</strong
          ><code>{{ token.value }}</code
          ><span>{{ token.use }}</span>
        </div>
      </div>
    </section>
    <section class="motion-rules">
      <h2>Application rules</h2>
      <dl>
        <div>
          <dt>Keep input immediate</dt>
          <dd>
            Typing, dragging, and value changes should respond directly. Animate the surrounding
            feedback only when it helps.
          </dd>
        </div>
        <div>
          <dt>Use movement to explain a change</dt>
          <dd>
            Keep travel short: 4–8 px for a small surface. Use opacity when spatial movement adds no
            meaning.
          </dd>
        </div>
        <div>
          <dt>Do not animate the background</dt>
          <dd>The tree and moon stay still. Ambient loops compete with the component examples.</dd>
        </div>
        <div>
          <dt>Respect reduced motion</dt>
          <dd>
            Remove spatial movement and looping effects. Keep the final state, labels, and progress
            values visible. Loading controls must retain a text label.
          </dd>
        </div>
        <div>
          <dt>Keep focus stable</dt>
          <dd>
            Animations must not delay keyboard interaction or move focus. A dismissed dialog returns
            focus to its trigger.
          </dd>
        </div>
      </dl>
    </section>
    <section class="motion-reference">
      <header>
        <div>
          <h2>Implementation</h2>
          <p>Motion variables are included in the main CSS export.</p>
        </div>
        <LibraryButton variant="secondary" @click="emit('copy', tokens)"
          >Copy motion tokens</LibraryButton
        >
      </header>
      <pre class="motion-code"><code>{{ snippet }}</code></pre>
    </section>
  </div>
</template>
