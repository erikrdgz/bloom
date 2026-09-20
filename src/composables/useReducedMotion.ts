import { onMounted, onUnmounted, ref } from 'vue'
export function useReducedMotion() {
  const reduced = ref(false)
  let query: MediaQueryList | undefined
  const update = () => {
    reduced.value = query?.matches ?? false
  }
  onMounted(() => {
    query = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    query.addEventListener('change', update)
  })
  onUnmounted(() => query?.removeEventListener('change', update))
  return reduced
}
