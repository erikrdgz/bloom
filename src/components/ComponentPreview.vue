<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpRight, ArrowRight, Check, Plus, Bell, Heart } from 'lucide-vue-next'
const emit = defineEmits<{ explore: [] }>()
const subscribed = ref(false)
const notifications = ref(true)
const selected = ref('Monthly')
const email = ref('')
const saved = ref(false)
</script>
<template>
  <section class="panel component-panel">
    <div class="panel-title">
      <div>
        <h2>Components</h2>
      </div>
      <button class="icon-button" aria-label="Explore components" @click="emit('explore')">
        <ArrowUpRight :size="20" />
      </button>
    </div>
    <div class="component-stage">
      <div class="sample-buttons">
        <button class="sample-primary" @click="subscribed = !subscribed">
          {{ subscribed ? 'Saved' : 'Save changes'
          }}<Check v-if="subscribed" :size="16" /><ArrowRight v-else :size="16" /></button
        ><button class="sample-secondary" @click="saved = !saved">
          <Heart :size="16" :fill="saved ? 'currentColor' : 'none'" />{{
            saved ? 'Saved' : 'Save for later'
          }}</button
        ><button class="round-add" aria-label="Toggle saved item" @click="saved = !saved">
          <Check v-if="saved" :size="18" /><Plus v-else :size="18" />
        </button>
      </div>
      <div class="sample-row">
        <div class="segment">
          <button
            v-for="period in ['Monthly', 'Yearly']"
            :key="period"
            :class="{ selected: selected === period }"
            @click="selected = period"
          >
            {{ period }}
          </button>
        </div>
        <span class="sample-badge"><span></span>In progress</span>
      </div>
      <div class="sample-row">
        <div class="avatar-stack"><span>JD</span><span>AK</span><span>LM</span><span>+4</span></div>
        <label class="toggle-label"
          ><Bell :size="15" /><span>Notifications</span
          ><input v-model="notifications" type="checkbox" role="switch" /><span
            class="toggle-track"
          ></span
        ></label>
      </div>
      <label class="sample-field"
        >Email address<input v-model="email" type="email" placeholder="name@example.com"
      /></label>
    </div>
    <div class="panel-foot">
      <span>Buttons, inputs, badges & more</span><span>Interactive examples</span>
    </div>
  </section>
</template>
