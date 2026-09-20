import { describe, expect, it } from 'vitest'
import { pageCode } from './inspect'
import { defaultSystem } from './system'
describe('contextual developer reference', () => {
  it('isolates typography and retains the complete font import', () => {
    const code = pageCode(defaultSystem, 'Typography')
    expect(code).toContain('&display=swap");')
    expect(code).toContain('--font-heading:')
    expect(code).not.toContain('--color-')
    expect(code).not.toContain('--space-')
  })
  it('keeps both color appearances without unrelated tokens', () => {
    const code = pageCode(defaultSystem, 'Colors')
    expect(code).toContain('[data-theme="dark"]')
    expect(code).toContain('--color-primary: #edb4c8')
    expect(code).not.toContain('--duration')
  })
  it('retains the reduced motion wrapper', () => {
    expect(pageCode(defaultSystem, 'Motion')).toContain(
      '@media (prefers-reduced-motion: reduce) {\n:root {',
    )
  })
  it('references symbol IDs in the actual sprite export', () => {
    expect(pageCode(defaultSystem, 'Icon set')).toContain('./bloom-icons.svg#heart')
  })
})
