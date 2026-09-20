import { describe, expect, it } from 'vitest'
import { defaultSystem, exportCSS, foreground, palette, parseSystem } from './system'
describe('design system interchange', () => {
  it('round-trips an exported system', () => {
    expect(parseSystem(JSON.stringify(defaultSystem))).toEqual(defaultSystem)
  })
  it('normalizes imported colors, names, and duplicate icons', () => {
    const result = parseSystem(
      JSON.stringify({
        ...defaultSystem,
        name: '  Studio  ',
        primary: '#AABBCC',
        icons: ['heart', 'heart', 'star'],
      }),
    )
    expect(result.name).toBe('Studio')
    expect(result.primary).toBe('#aabbcc')
    expect(result.icons).toEqual(['heart', 'star'])
  })
  it.each([
    { primary: 'red; } body { display:none' },
    { radius: -1 },
    { spacing: 2.5 },
    { font: 'untrusted-font' },
    { version: 2 },
    { icons: ['unknown'] },
    { name: ' ' },
  ])('rejects invalid input %j', (patch) => {
    expect(() => parseSystem(JSON.stringify({ ...defaultSystem, ...patch }))).toThrow()
  })
  it('reports malformed JSON', () => {
    expect(() => parseSystem('{bad')).toThrow('not valid JSON')
  })
})
describe('generated tokens', () => {
  it('keeps the seed at 500 with ten unique ordered steps', () => {
    const result = palette('#ed6239')
    expect(result).toHaveLength(10)
    expect(result[5]).toEqual({ step: 500, color: '#ed6239' })
    expect(new Set(result.map((p) => p.color)).size).toBe(10)
    expect(result.every((p) => /^#[a-f0-9]{6}$/.test(p.color))).toBe(true)
  })
  it('chooses readable foregrounds for extreme colors', () => {
    expect(foreground('#ffffff')).toBe('#000000')
    expect(foreground('#000000')).toBe('#ffffff')
  })
  it('exports edited values and both theme surfaces', () => {
    const css = exportCSS({ ...defaultSystem, spacing: 6, radius: 20 })
    expect(css).toContain('--space-16: 96px;')
    expect(css).toContain('--radius: 20px;')
    expect(css).toContain('--type-display-size: 3.8125rem;')
    expect(css).toContain('--color-success: #357760;')
    expect(css).toContain('[data-theme="dark"]')
    expect(css).toContain('--color-primary-500: #edb4c8;')
  })
})

describe('motion token export', () => {
  it('exports normal timings and resets them in the reduced-motion media query', () => {
    const css = exportCSS(defaultSystem)
    const [normal, reduced] = css.split('@media (prefers-reduced-motion: reduce)')
    expect(normal).toContain('--duration-standard: 200ms;')
    expect(normal).toContain('--ease-enter: cubic-bezier(0, 0, 0.2, 1);')
    expect(reduced).toContain('--duration-standard: 0ms;')
    expect(reduced).toContain('--duration-deliberate: 0ms;')
  })
})

describe('created systems', () => {
  it('preserves font pairs, neutral surfaces, secondary palette, and motion in exports', () => {
    const system = parseSystem(
      JSON.stringify({
        ...defaultSystem,
        name: 'Northstar',
        font: 'Source Sans 3',
        headingFont: 'Lora',
        secondary: '#7054ba',
        neutral: 'slate',
        baseSize: 18,
        typeRatio: 1.333,
        elevation: 'raised',
        motion: 'calm',
      }),
    )
    expect(parseSystem(JSON.stringify(system))).toEqual(system)
    const css = exportCSS(system)
    expect(css).toContain("--font-heading: 'Lora', serif;")
    expect(css).toContain('--color-secondary-500: #7054ba;')
    expect(css).toContain('--color-background: #121b27;')
    expect(css).toContain('--duration-standard: 280ms;')
    expect(css).toContain('--type-body-size: 1.125rem;')
    expect(css).toContain('family=Source+Sans+3')
  })
  it('upgrades earlier JSON exports while preserving existing choices', () => {
    const legacy = {
      version: 1,
      name: 'Existing',
      description: '',
      primary: '#123456',
      font: 'DM Sans',
      spacing: 6,
      radius: 4,
      icons: [],
    }
    const upgraded = parseSystem(JSON.stringify(legacy))
    expect(upgraded.primary).toBe('#123456')
    expect(upgraded.spacing).toBe(6)
    expect(upgraded.headingFont).toBe('DM Sans')
    expect(upgraded.baseSize).toBe(16)
    expect(upgraded.neutral).toBe('slate')
  })
  it.each([
    { headingFont: 'Missing' },
    { secondary: '#00' },
    { baseSize: 100 },
    { typeRatio: 9 },
    { neutral: 'unknown' },
    { elevation: 'unknown' },
    { motion: 'unknown' },
  ])('rejects invalid creation settings %j', (patch) => {
    expect(() => parseSystem(JSON.stringify({ ...defaultSystem, ...patch }))).toThrow()
  })
})
