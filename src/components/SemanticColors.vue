<script setup lang="ts">
import ColorPicker from './ui/ColorPicker.vue'
import { computed } from 'vue'
import {
  feedbackRoles,
  uiTokens,
  contrast,
  palette,
  type DesignSystem,
  type FeedbackRole,
} from '../lib/system'
const props = defineProps<{ system: DesignSystem; compact?: boolean }>()
const emit = defineEmits<{ update: [value: DesignSystem['feedback']] }>()
const meaning = {
  success: 'A completed action or positive outcome.',
  warning: 'A condition that needs attention before proceeding.',
  error: 'A failed action, invalid input, or destructive outcome.',
  info: 'Helpful context without a change in urgency.',
}
function update(role: FeedbackRole, value: string) {
  emit('update', { ...props.system.feedback, [role]: value })
}
const light = computed(() => uiTokens(props.system, 'light'))
const dark = computed(() => uiTokens(props.system, 'dark'))
</script>
<template>
  <section class="semantic-editor">
    <h2>Feedback colors</h2>
    <p>
      Give each status a consistent meaning. Pair color with a label or icon, never color alone.
    </p>
    <div class="feedback-grid">
      <article v-for="role in feedbackRoles" :key="role">
        <ColorPicker
          :model-value="system.feedback[role]"
          :label="role"
          @update:model-value="update(role, $event)"
        />
        <p>{{ meaning[role] }}</p>
        <div class="feedback-scale">
          <span
            v-for="shade in palette(system.feedback[role])"
            :key="shade.step"
            :style="{ background: shade.color }"
            :title="`${role}-${shade.step}: ${shade.color}`"
          ></span>
        </div>
        <div v-if="!compact" class="feedback-examples">
          <div
            v-for="(tokens, mode) in { light, dark }"
            :key="mode"
            :style="{
              background: tokens[`${role}-surface`],
              color: tokens[`${role}-text`],
              borderColor: tokens[`${role}-border`],
            }"
          >
            <strong>{{ role }} · {{ mode }}</strong
            ><span
              >{{ contrast(tokens[`${role}-text`]!, tokens[`${role}-surface`]!).toFixed(2) }}:1 text
              contrast</span
            >
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
