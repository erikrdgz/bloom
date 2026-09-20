import { exportCSS, type DesignSystem } from './system'

export function pageCode(system: DesignSystem, section: string): string {
  if (section === 'Overview')
    return JSON.stringify(
      {
        name: system.name,
        description: system.description,
        foundations: {
          colors: 'Colors',
          typography: 'Typography',
          spacing: 'Spacing & shape',
          motion: 'Motion',
        },
        export: 'Use Export for the code ZIP, PDF reference, CSS, or Bloom JSON.',
      },
      null,
      2,
    )
  if (section === 'Icon set')
    return system.icons
      .map((name) => `<svg aria-hidden="true"><use href="./bloom-icons.svg#${name}" /></svg>`)
      .join('\n')
  const pattern =
    section === 'Colors'
      ? /--color-|--surface-|--text-|--border-|--action-|--focus-|--success-|--warning-|--error-|--info-/
      : section === 'Typography'
        ? /--font-|--type-/
        : section === 'Spacing & shape'
          ? /--space-|--radius|--shadow/
          : /--duration-|--ease-/
  const css = exportCSS(system)
  const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap((match) => {
    const declarations = match[2]!.split('\n').filter((line) => pattern.test(line))
    if (!declarations.length) return []
    const selector = match[1]!.trim().replace(/^@import[^\n]+\s*/, '')
    return [`${selector} {\n${declarations.join('\n')}\n}`]
  })
  if (section === 'Motion')
    return (
      blocks.slice(0, 1).join('\n') +
      '\n\n@media (prefers-reduced-motion: reduce) {\n' +
      blocks.slice(1).join('\n') +
      '\n}'
    )
  return (
    (section === 'Typography' ? (css.match(/^@import[^\n]+/)?.[0] ?? '') + '\n\n' : '') +
    blocks.join('\n\n')
  )
}

export const componentTokens: Record<string, string[]> = {
  Buttons: ['color-primary', 'color-on-primary', 'radius', 'space-2', 'duration-fast'],
  'Text fields': ['color-surface', 'color-text', 'color-border', 'color-error', 'radius'],
  Select: ['color-surface', 'color-text', 'color-border', 'radius'],
  Switches: ['color-primary', 'duration-fast', 'ease-standard'],
  Tabs: ['color-primary', 'color-border', 'space-4'],
  Checkboxes: ['color-primary', 'color-on-primary', 'color-border'],
  'Radio group': ['color-primary', 'color-border'],
  Accordion: ['color-border', 'space-4', 'duration-standard'],
  Badges: ['color-primary', 'color-success', 'color-warning', 'color-error'],
  Avatars: ['color-secondary', 'color-on-secondary'],
  Alerts: ['color-success', 'color-error', 'color-warning', 'radius'],
  Progress: ['color-primary', 'color-border'],
  Table: ['color-border', 'color-surface', 'color-text', 'space-3'],
  Dialog: ['color-surface', 'shadow', 'radius', 'duration-deliberate'],
}
