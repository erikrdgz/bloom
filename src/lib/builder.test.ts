import { describe, expect, it } from 'vitest'
import { defaultSystem, exportCSS, parseSystem } from './system'
import { bundleFiles } from './exportBundle'
import {
  componentKinds,
  makeComponent,
  parseComponents,
  resolveComponent,
  saveComponentToSystem,
  systemButtonStyle,
} from './builder'

describe('component builder persistence', () => {
  it('round trips all twelve component types and supports older exports', () => {
    const components = componentKinds.map((kind) => makeComponent(kind, defaultSystem))
    expect(components).toHaveLength(12)
    const restored = parseSystem(JSON.stringify({ ...defaultSystem, components }))
    expect(restored.components).toEqual(components)
    const { components: _, ...legacy } = defaultSystem
    expect(parseSystem(JSON.stringify(legacy)).components).toEqual([])
  })
  it.each([
    { style: { ...makeComponent('button', defaultSystem).style, topLeft: -1 } },
    { style: { ...makeComponent('button', defaultSystem).style, shadowBlur: 1000 } },
    { style: { ...makeComponent('button', defaultSystem).style, background: 'red;display:none' } },
    { kind: 'unknown' },
    { name: '' },
    { id: 'x{}' },
    { linkedTo: 'missing' },
  ])('rejects malformed saved components %j', (patch) => {
    expect(() =>
      parseComponents([{ ...makeComponent('button', defaultSystem), ...patch }]),
    ).toThrow()
  })
  it('rejects duplicate ids, conflicting button roles, cycles, and cross-type inheritance', () => {
    const a = makeComponent('button', defaultSystem)
    const b = makeComponent('button', defaultSystem)
    expect(() => parseComponents([a, a])).toThrow()
    expect(() =>
      parseComponents([
        { ...a, buttonRole: 'primary' },
        { ...b, buttonRole: 'primary' },
      ]),
    ).toThrow()
    expect(() =>
      parseComponents([
        { ...a, linkedTo: b.id },
        { ...b, linkedTo: a.id },
      ]),
    ).toThrow()
    expect(() =>
      parseComponents([a, { ...makeComponent('card', defaultSystem), linkedTo: a.id }]),
    ).toThrow()
  })
})

describe('linked component variants', () => {
  it('creates a button family and propagates appearance without overwriting variant colors', () => {
    const button = makeComponent('button', defaultSystem)
    let system = saveComponentToSystem(defaultSystem, button)
    expect(system.components.map((c) => c.buttonRole)).toEqual([
      'primary',
      'secondary',
      'quiet',
      'danger',
    ])
    const secondary = system.components.find((c) => c.buttonRole === 'secondary')!
    const color = secondary.style.background
    system = saveComponentToSystem(system, {
      ...system.components[0]!,
      style: { ...button.style, topLeft: 37, shadowBlur: 23, glowBlur: 19 },
    })
    expect(resolveComponent(secondary, system.components).style).toMatchObject({
      topLeft: 37,
      shadowBlur: 23,
      glowBlur: 19,
      background: color,
    })
    expect(systemButtonStyle(system, 'secondary')?.borderRadius).toBe('37px 12px 12px 12px')
    expect(defaultSystem.components).toEqual([])
    expect(button.style.topLeft).toBe(12)
  })
  it('freezes a detached variant and allows relinking to the latest source', () => {
    let system = saveComponentToSystem(defaultSystem, makeComponent('button', defaultSystem))
    const secondary = system.components.find((c) => c.buttonRole === 'secondary')!
    const detached = resolveComponent(secondary, system.components)
    delete detached.linkedTo
    system = saveComponentToSystem(system, detached)
    const primary = system.components.find((c) => c.buttonRole === 'primary')!
    system = saveComponentToSystem(system, { ...primary, style: { ...primary.style, topLeft: 42 } })
    expect(
      resolveComponent(
        system.components.find((c) => c.id === secondary.id)!,
        system.components,
      ).style.topLeft,
    ).toBe(12)
    system = saveComponentToSystem(system, { ...detached, linkedTo: primary.id })
    expect(
      resolveComponent(
        system.components.find((c) => c.id === secondary.id)!,
        system.components,
      ).style.topLeft,
    ).toBe(42)
  })
  it('updates an existing variant instead of adding duplicates and keeps systems isolated', () => {
    const button = makeComponent('button', defaultSystem)
    const first = saveComponentToSystem(defaultSystem, button)
    const second = saveComponentToSystem(first, { ...first.components[0]!, name: 'Renamed' })
    expect(second.components).toHaveLength(4)
    expect(first.components[0]!.name).not.toBe('Renamed')
    expect(defaultSystem.components).toHaveLength(0)
  })
  it('moves linked instances to a replacement source while leaving detached instances alone', () => {
    let system = saveComponentToSystem(defaultSystem, makeComponent('button', defaultSystem))
    const danger = resolveComponent(
      system.components.find((c) => c.buttonRole === 'danger')!,
      system.components,
    )
    delete danger.linkedTo
    system = saveComponentToSystem(system, danger)
    const replacement = { ...makeComponent('button', system), buttonRole: 'primary' as const }
    system = saveComponentToSystem(system, replacement)
    expect(system.components.filter((c) => c.buttonRole === 'primary')).toHaveLength(1)
    expect(system.components.find((c) => c.buttonRole === 'secondary')?.linkedTo).toBe(
      replacement.id,
    )
    expect(system.components.find((c) => c.buttonRole === 'danger')?.linkedTo).toBeUndefined()
  })
  it('exports resolved appearance and preserves editable relationships in JSON', () => {
    let system = saveComponentToSystem(defaultSystem, makeComponent('button', defaultSystem))
    const primary = system.components[0]!
    system = saveComponentToSystem(system, { ...primary, style: { ...primary.style, topLeft: 33 } })
    const files = bundleFiles(system)
    expect(parseSystem(files['bloom.json']!).components).toEqual(system.components)
    expect(files['components.css']).toContain('.button.secondary {')
    expect(files['components.css']).toContain('border-radius: 33px 12px 12px 12px;')
    const secondary = system.components.find((c) => c.buttonRole === 'secondary')!
    expect(exportCSS(system).split(`.bloom-component-${secondary.id} {`)[1]).toContain(
      'border-radius: 33px 12px 12px 12px;',
    )
  })
})
