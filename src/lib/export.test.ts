import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { defaultSystem, parseSystem, uiTokens, contrast, feedbackRoles, exportCSS } from './system'
import { exportCode, starterCSS } from './exportBundle'
import { createSystemPDF } from './exportPDF'

describe('complete system exports', () => {
  it('migrates legacy feedback and rejects invalid status colors', () => {
    expect(parseSystem(JSON.stringify({ ...defaultSystem, feedback: undefined })).feedback).toEqual(
      defaultSystem.feedback,
    )
    expect(() =>
      parseSystem(JSON.stringify({ ...defaultSystem, feedback: { success: 'red' } })),
    ).toThrow()
  })
  it.each(['#ffffff', '#000000', '#888888', '#ff00ff', '#00ffff'])(
    'keeps feedback and action text readable for %s',
    (color) => {
      const system = {
        ...defaultSystem,
        primary: color,
        feedback: Object.fromEntries(
          feedbackRoles.map((role) => [role, color]),
        ) as typeof defaultSystem.feedback,
      }
      for (const mode of ['light', 'dark'] as const) {
        const t = uiTokens(system, mode)
        for (const role of feedbackRoles) {
          expect(contrast(t[`${role}-text`]!, t[`${role}-surface`]!)).toBeGreaterThanOrEqual(4.5)
          expect(contrast(t[`${role}-border`]!, t[`${role}-surface`]!)).toBeGreaterThanOrEqual(3)
        }
        for (const state of ['primary', 'primary-hover', 'primary-active'])
          expect(contrast(t['action-on-primary']!, t[`action-${state}`]!)).toBeGreaterThanOrEqual(
            4.5,
          )
      }
    },
  )
  it('produces a reimportable ZIP with resolved CSS references and escaped demo content', () => {
    const system = { ...defaultSystem, name: '<script>alert(1)</script>' }
    const files = unzipSync(exportCode(system))
    expect(Object.keys(files)).toHaveLength(6)
    expect(parseSystem(strFromU8(files['bloom.json']!))).toEqual(system)
    expect(strFromU8(files['index.html']!)).toContain('&lt;script&gt;')
    const css = exportCSS(system)
    const references = [...(css + starterCSS).matchAll(/var\(--([\w-]+)/g)].map((match) => match[1])
    for (const key of references) expect(css).toContain(`--${key}:`)
    const manifest = JSON.parse(strFromU8(files['tokens.json']!))
    expect(
      Object.values(manifest.primitives).flatMap((family) => Object.keys(family as object)),
    ).toHaveLength(70)
    expect(manifest.themes.dark['success-text']).toBe(uiTokens(system, 'dark')['success-text'])
  })
  it('generates a six-page portable PDF', () => {
    const pdf = createSystemPDF(defaultSystem)
    expect(pdf.getNumberOfPages()).toBe(6)
    expect(pdf.output()).toContain('%PDF-')
  })
})
