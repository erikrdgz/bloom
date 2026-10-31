import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { contrast, defaultSystem, parseSystem, type DesignSystem } from './system'
import { makeComponent, resolveComponent, saveComponentToSystem } from './builder'
import { studioTheme } from './studioTheme'

describe('the studio follows the active system', () => {
  it.each([false, true])('keeps brand headlines readable in dark=%s', (dark) => {
    for (const primary of ['#edb4c8', '#ffffff', '#000000', '#355ae0']) {
      const theme = studioTheme({ ...defaultSystem, primary }, dark)
      expect(
        contrast(theme['--hero-accent']!, dark ? '#171f2a' : '#edf0f4'),
      ).toBeGreaterThanOrEqual(4.5)
    }
    if (dark) expect(studioTheme(defaultSystem, true)['--hero-accent']).toBe(defaultSystem.primary)
  })
  it('reacts to font changes and applies the selected theme surfaces', () => {
    const system = ref<DesignSystem>(structuredClone(defaultSystem))
    const dark = ref(false)
    const theme = computed(() => studioTheme(system.value, dark.value))
    system.value.font = 'Source Sans 3'
    system.value.headingFont = 'Lora'
    expect(theme.value['--sample-font']).toBe("'Source Sans 3', sans-serif")
    expect(theme.value['--heading-font']).toBe("'Lora', serif")
    const lightFill = theme.value['--studio-button-secondary-background']
    dark.value = true
    expect(theme.value['--studio-button-secondary-background']).not.toBe(lightFill)
    expect(theme.value['--studio-button-secondary-background']).toBe(theme.value['--surface'])
  })
  it('updates studio actions on save and preserves detached secondary styling', () => {
    const system = ref<DesignSystem>(
      saveComponentToSystem(defaultSystem, makeComponent('button', defaultSystem)),
    )
    const theme = computed(() => studioTheme(system.value, false))
    const secondary = resolveComponent(
      system.value.components.find((c) => c.buttonRole === 'secondary')!,
      system.value.components,
    )
    delete secondary.linkedTo
    secondary.style.topLeft = 3
    system.value = saveComponentToSystem(system.value, secondary)
    const primary = system.value.components.find((c) => c.buttonRole === 'primary')!
    system.value = saveComponentToSystem(system.value, {
      ...primary,
      style: { ...primary.style, topLeft: 40, glowBlur: 22, background: '#123456' },
    })
    expect(theme.value['--studio-button-primary-border-radius']).toBe('40px 12px 12px 12px')
    expect(theme.value['--studio-button-primary-background']).toBe('#123456')
    expect(theme.value['--studio-button-primary-box-shadow']).toContain('0 0 22px')
    expect(theme.value['--studio-button-quiet-border-radius']).toBe('40px 12px 12px 12px')
    expect(theme.value['--studio-button-secondary-border-radius']).toBe('3px 12px 12px 12px')
  })
  it('restores saved typography and component styles after reload without leaking to another system', () => {
    const original: DesignSystem = {
      ...structuredClone(defaultSystem),
      font: 'Inter',
      headingFont: 'Libre Baskerville',
    }
    const component = makeComponent('button', original)
    component.style.background = '#123456'
    component.style.topLeft = 28
    const saved = saveComponentToSystem(original, component)
    const active = ref(parseSystem(JSON.stringify(saved)))
    const theme = computed(() => studioTheme(active.value, false))
    expect(theme.value['--heading-font']).toBe("'Libre Baskerville', serif")
    expect(theme.value['--studio-button-primary-background']).toBe('#123456')
    active.value = structuredClone(defaultSystem)
    expect(theme.value['--sample-font']).toBe("'DM Sans', sans-serif")
    expect(theme.value['--studio-button-primary-background']).toBe(defaultSystem.primary)
    expect(theme.value['--studio-button-primary-border-radius']).toBe('24px')
    expect(theme.value['--studio-button-primary-box-shadow']).not.toContain('22px')
  })
})
