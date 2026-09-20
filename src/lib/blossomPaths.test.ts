import { expect, it } from 'vitest'
import { blossoms } from './blossoms'
import { blossomPaths } from './blossomPaths'
it('retains every flower and petal in a bounded set of depth and color paths', () => {
  expect(blossomPaths.length).toBeLessThanOrEqual(14)
  for (const rear of [true, false]) {
    const original = blossoms.filter((f) => f.rear === rear)
    const paths = blossomPaths.filter((p) => p.rear === rear)
    const expected = original.reduce((count, f) => count + (f.bud ? 1 : 5), 0)
    const d = paths.map((p) => p.d).join('')
    expect((d.match(/M/g) ?? []).length).toBe(expected)
    expect(d).not.toMatch(/NaN|Infinity/)
    expect(new Set(paths.map((p) => p.tone)).size).toBe(paths.length)
  }
})
