import { computed, ref, watch } from 'vue'
import { defaultSystem, parseSystem, type DesignSystem } from '../lib/system'
interface SavedSystem {
  id: string
  system: DesignSystem
}
export function useSystems() {
  const projects = ref<SavedSystem[]>([])
  const activeId = ref('starter')
  const storageError = ref('')
  try {
    const saved = localStorage.getItem('bloom-workspace')
    if (saved) {
      const workspace = JSON.parse(saved)
      if (!Array.isArray(workspace.projects) || workspace.projects.length === 0)
        throw new Error('Empty workspace')
      projects.value = workspace.projects.map((entry: SavedSystem) => {
        if (typeof entry.id !== 'string') throw new Error('Invalid system ID')
        return { id: entry.id, system: parseSystem(JSON.stringify(entry.system)) }
      })
      activeId.value = projects.value.some((entry) => entry.id === workspace.activeId)
        ? workspace.activeId
        : projects.value[0]!.id
    } else {
      const legacy =
        localStorage.getItem('bloom-system') ??
        localStorage.getItem('bough-system') ??
        localStorage.getItem('formwork-system')
      projects.value = [
        { id: 'starter', system: legacy ? parseSystem(legacy) : structuredClone(defaultSystem) },
      ]
    }
  } catch {
    projects.value = [{ id: 'starter', system: structuredClone(defaultSystem) }]
  }
  for (const entry of projects.value) {
    if (
      entry.id === 'starter' &&
      entry.system.name === 'Bloom' &&
      entry.system.primary !== defaultSystem.primary
    )
      entry.system.name = 'Bloom study'
  }
  const existingDefault = projects.value.find((entry) => entry.id === 'bloom-default')
  if (existingDefault) existingDefault.system = structuredClone(defaultSystem)
  else projects.value.unshift({ id: 'bloom-default', system: structuredClone(defaultSystem) })
  if (
    projects.value.length === 2 &&
    JSON.stringify(projects.value[1]?.system) === JSON.stringify(defaultSystem)
  ) {
    projects.value.splice(1, 1)
    activeId.value = 'bloom-default'
  }
  watch(
    projects,
    () => {
      const original = projects.value.find((entry) => entry.id === 'bloom-default')!
      if (JSON.stringify(original.system) !== JSON.stringify(defaultSystem)) {
        const edited = parseSystem(JSON.stringify(original.system))
        original.system = structuredClone(defaultSystem)
        const id = crypto.randomUUID()
        projects.value.push({ id, system: { ...edited, name: 'Bloom study' } })
        activeId.value = id
      }
    },
    { deep: true, flush: 'post' },
  )
  const system = computed<DesignSystem>({
    get: () => projects.value.find((entry) => entry.id === activeId.value)!.system,
    set: (value) => {
      const entry = projects.value.find((entry) => entry.id === activeId.value)
      if (entry) entry.system = value
    },
  })
  watch(
    [projects, activeId],
    () => {
      try {
        localStorage.setItem(
          'bloom-workspace',
          JSON.stringify({ activeId: activeId.value, projects: projects.value }),
        )
        storageError.value = ''
      } catch {
        storageError.value =
          'Browser storage is full or unavailable. Export a JSON copy to keep your changes.'
      }
    },
    { deep: true },
  )
  function addSystem(value: DesignSystem) {
    const id = crypto.randomUUID()
    projects.value.push({ id, system: parseSystem(JSON.stringify(value)) })
    activeId.value = id
  }
  return { projects, activeId, system, addSystem, storageError }
}
