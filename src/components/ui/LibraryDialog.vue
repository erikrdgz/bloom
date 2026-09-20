<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
const open = defineModel<boolean>({ required: true })
defineProps<{ title: string; description?: string }>()
const dialog = ref<HTMLDialogElement>()
watch(
  open,
  async (value) => {
    await nextTick()
    if (value && !dialog.value?.open) dialog.value?.showModal()
    else if (!value) dialog.value?.close()
  },
  { immediate: true },
)
</script>
<template>
  <dialog ref="dialog" :aria-label="title" @cancel.prevent="open = false" @close="open = false">
    <div class="library-dialog">
      <div class="library-dialog-heading">
        <h2>{{ title }}</h2>
        <button class="icon-button" aria-label="Close dialog" @click="open = false">
          <X :size="20" />
        </button>
      </div>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>
  </dialog>
</template>
