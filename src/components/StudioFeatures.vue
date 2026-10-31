<script setup lang="ts">
import { ArrowUpRight, Plus } from 'lucide-vue-next'
import BlossomStudy from './BlossomStudy.vue'
defineProps<{ componentCount: number }>()
defineEmits<{ build: []; system: [] }>()
</script>
<template>
  <div class="studio-features" data-page-cascade>
    <section class="workshop-feature">
      <div class="feature-copy">
        <h2>Component builder</h2>
        <p>Customize components and save reusable variants.</p>
        <button class="feature-link" @click="$emit('build')">
          Open the workshop <ArrowUpRight :size="18" />
        </button>
      </div>
      <div class="workshop-miniature" aria-hidden="true">
        <div class="miniature-orbit"></div>
        <div class="miniature-component">
          <Plus :size="18" /> Make something <i></i><i></i><i></i><i></i>
        </div>
        <div class="miniature-swatches"><i></i><i></i><i></i></div>
      </div>
    </section>
    <section class="system-feature">
      <BlossomStudy />
      <div class="feature-copy">
        <h2>Your system</h2>
        <p>
          {{
            componentCount
              ? `${componentCount} saved component${componentCount === 1 ? '' : 's'}.`
              : 'Review your foundations and components together.'
          }}
        </p>
        <button class="feature-link" @click="$emit('system')">
          View your system <ArrowUpRight :size="18" />
        </button>
      </div>
    </section>
  </div>
</template>
