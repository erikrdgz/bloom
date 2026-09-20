import { expect, it } from 'vitest'
import { normalizeHex, hexToHsl, hslToHex } from './color'
import { directions, applyDirection, newDraft } from './presets'
import { parseSystem } from './system'
it('normalizes short hex and rejects incomplete or unsafe input', () => {
  expect(normalizeHex(' ABC ')).toBe('#aabbcc')
  expect(normalizeHex('#EDB4C8')).toBe('#edb4c8')
  expect(normalizeHex('#12345')).toBeNull()
  expect(normalizeHex('red;')).toBeNull()
})
it.each(['#000000', '#ffffff', '#888888', '#edb4c8', '#ff0000', '#00ff00', '#0000ff'])(
  'round trips %s through HSL without drift',
  (hex) => {
    const { h, s, l } = hexToHsl(hex)
    expect(hslToHex(h, s, l)).toBe(hex)
  },
)
it('applies every coordinated preset without losing project details', () => {
  for (const preset of directions) {
    const system = applyDirection(
      { ...newDraft(), name: 'My project', description: 'A starting point' },
      preset.id,
    )
    expect(parseSystem(JSON.stringify(system))).toEqual(system)
    expect(system.name).toBe('My project')
    expect(system.description).toBe('A starting point')
    expect(system.radius).toBe(preset.values.radius)
    expect(system.headingFont).toBe(preset.values.headingFont)
  }
})
