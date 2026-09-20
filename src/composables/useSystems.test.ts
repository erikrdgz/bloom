import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { useSystems } from './useSystems'
import { defaultSystem } from '../lib/system'
afterEach(() => vi.unstubAllGlobals())
describe('original Bloom workspace', () => {
  it('keeps the pink original and saves edits into a separate system', async () => {
    const data = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    })
    const scope = effectScope()
    const workspace = scope.run(() => useSystems())!
    expect(workspace.activeId.value).toBe('bloom-default')
    workspace.system.value.primary = '#123456'
    await nextTick()
    expect(workspace.projects.value.find((p) => p.id === 'bloom-default')?.system.primary).toBe(
      '#edb4c8',
    )
    expect(workspace.system.value.primary).toBe('#123456')
    expect(workspace.system.value.name).toBe('Bloom study')
    scope.stop()
    const restoredScope = effectScope()
    const restored = restoredScope.run(() => useSystems())!
    expect(restored.system.value.primary).toBe('#123456')
    expect(restored.projects.value.filter((p) => p.id === 'bloom-default')).toHaveLength(1)
    expect(restored.projects.value.find((p) => p.id === 'bloom-default')?.system).toEqual(
      defaultSystem,
    )
    restoredScope.stop()
  })
})
