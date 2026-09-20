import { motionDeclarations, reducedMotionCSS } from './motion'
import { fonts, fontFamily, fontStylesheet, type FontFamily } from './fonts'
export { fonts, fontFamily } from './fonts'
export const feedbackRoles = ['success', 'warning', 'error', 'info'] as const
export type FeedbackRole = (typeof feedbackRoles)[number]
export const defaultFeedback = {
  success: '#357760',
  warning: '#bd821b',
  error: '#cb4e4e',
  info: '#3979c3',
}
export interface DesignSystem {
  version: 1
  feedback: Record<FeedbackRole, string>
  name: string
  description: string
  primary: string
  font: FontFamily
  headingFont: FontFamily
  secondary: string
  neutral: 'stone' | 'slate' | 'zinc'
  baseSize: number
  typeRatio: number
  elevation: 'none' | 'soft' | 'raised'
  motion: 'calm' | 'standard' | 'snappy'
  radius: number
  spacing: number
  icons: string[]
}
export const defaultSystem: DesignSystem = {
  version: 1,
  name: 'Bloom',
  feedback: { ...defaultFeedback },
  description: 'Design tokens and component examples.',
  primary: '#edb4c8',
  font: 'DM Sans',
  headingFont: 'Space Grotesk',
  secondary: '#718198',
  neutral: 'slate',
  baseSize: 16,
  typeRatio: 1.25,
  elevation: 'soft',
  motion: 'standard',
  radius: 12,
  spacing: 4,
  icons: ['heart', 'star', 'bolt', 'moon', 'sun', 'check'],
}
export const iconNames = [
  'heart',
  'star',
  'bolt',
  'moon',
  'sun',
  'check',
  'arrow-right',
  'plus',
  'bell',
  'house',
  'gear',
  'user',
]
export const semanticColors = [
  { name: 'Neutral', hex: '#747570' },
  { name: 'Success', hex: '#357760' },
  { name: 'Warning', hex: '#bd821b' },
  { name: 'Error', hex: '#cb4e4e' },
]
export function parseSystem(input: string): DesignSystem {
  let value: unknown
  try {
    value = JSON.parse(input)
  } catch {
    throw new Error('This file is not valid JSON.')
  }
  if (!value || typeof value !== 'object') throw new Error('Expected a Bloom design system object.')
  const s = value as Record<string, unknown>
  if (s.version !== 1)
    throw new Error('Expected a Bloom version 1 export. Other formats are not supported yet.')
  if (typeof s.name !== 'string' || !s.name.trim() || s.name.length > 40)
    throw new Error('The system name must contain 1–40 characters.')
  if (typeof s.primary !== 'string' || !/^#[0-9a-f]{6}$/i.test(s.primary))
    throw new Error('Primary color must be a six-digit hex value, such as #ed6239.')
  if (!fonts.includes(s.font as DesignSystem['font']))
    throw new Error('Choose a font from the Bloom font library.')
  if (typeof s.radius !== 'number' || !Number.isFinite(s.radius) || s.radius < 0 || s.radius > 24)
    throw new Error('Radius must be between 0 and 24.')
  if (
    typeof s.spacing !== 'number' ||
    !Number.isInteger(s.spacing) ||
    s.spacing < 2 ||
    s.spacing > 8
  )
    throw new Error('Spacing must be a whole number between 2 and 8.')
  if (
    !Array.isArray(s.icons) ||
    !s.icons.every((i) => typeof i === 'string' && iconNames.includes(i))
  )
    throw new Error('The icon set contains unsupported icons.')
  const headingFont = s.headingFont ?? s.font
  if (!fonts.includes(headingFont as FontFamily))
    throw new Error('Choose a supported heading font.')
  const secondary = s.secondary ?? defaultSystem.secondary
  if (typeof secondary !== 'string' || !/^#[0-9a-f]{6}$/i.test(secondary))
    throw new Error('Secondary color must be a six-digit hex value.')
  const neutral = s.neutral ?? defaultSystem.neutral
  const elevation = s.elevation ?? defaultSystem.elevation
  const motion = s.motion ?? defaultSystem.motion
  if (!['stone', 'slate', 'zinc'].includes(neutral as string))
    throw new Error('Choose a supported neutral palette.')
  if (!['none', 'soft', 'raised'].includes(elevation as string))
    throw new Error('Choose a supported elevation.')
  if (!['calm', 'standard', 'snappy'].includes(motion as string))
    throw new Error('Choose a supported motion profile.')
  const baseSize = s.baseSize ?? defaultSystem.baseSize
  const typeRatio = s.typeRatio ?? defaultSystem.typeRatio
  if (typeof baseSize !== 'number' || !Number.isInteger(baseSize) || baseSize < 14 || baseSize > 20)
    throw new Error('Base font size must be 14–20px.')
  if (typeof typeRatio !== 'number' || ![1.125, 1.2, 1.25, 1.333].includes(typeRatio))
    throw new Error('Choose a supported type scale.')
  const feedback = { ...defaultFeedback }
  if (s.feedback !== undefined) {
    if (!s.feedback || typeof s.feedback !== 'object' || Array.isArray(s.feedback))
      throw new Error('Feedback colors must be an object.')
    for (const role of feedbackRoles) {
      const value = (s.feedback as Record<string, unknown>)[role] ?? defaultFeedback[role]
      if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value))
        throw new Error(`${role} must be a six-digit hex color.`)
      feedback[role] = value.toLowerCase()
    }
  }
  return {
    version: 1,
    feedback,
    // Earlier starter names are migrated without changing customized tokens.
    name: ['Forma', 'Bough', 'Formwork'].includes(s.name.trim()) ? 'Bloom' : s.name.trim(),
    description: typeof s.description === 'string' ? s.description.slice(0, 160) : '',
    primary: s.primary.toLowerCase(),
    font: s.font as FontFamily,
    headingFont: headingFont as FontFamily,
    secondary: secondary.toLowerCase(),
    neutral: neutral as DesignSystem['neutral'],
    elevation: elevation as DesignSystem['elevation'],
    motion: motion as DesignSystem['motion'],
    baseSize,
    typeRatio,
    radius: s.radius,
    spacing: s.spacing,
    icons: [...new Set(s.icons)] as string[],
  }
}
function mix(hex: string, target: number, amount: number) {
  return (
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - amount) + target * amount)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}
export function palette(hex: string) {
  return [0.94, 0.84, 0.65, 0.44, 0.22, 0, -0.16, -0.32, -0.48, -0.64].map((n, i) => ({
    step: i === 0 ? 50 : i * 100,
    color: n >= 0 ? mix(hex, 255, n) : mix(hex, 0, -n),
  }))
}
export function foreground(hex: string) {
  const rgb = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const l = rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722
  return (l + 0.05) / 0.05 > 1.05 / (l + 0.05) ? '#000000' : '#ffffff'
}
export const neutralPalettes = {
  stone: {
    light: { surface: '#fffdf8', text: '#292923', background: '#f4f2ec', border: '#dedcd3' },
    dark: { surface: '#242520', text: '#f3f1e8', background: '#191b17', border: '#41443a' },
  },
  slate: {
    light: { surface: '#ffffff', text: '#202936', background: '#f1f4f8', border: '#d9e0e8' },
    dark: { surface: '#1c2633', text: '#eaf0f7', background: '#121b27', border: '#344456' },
  },
  zinc: {
    light: { surface: '#ffffff', text: '#27272a', background: '#f4f4f5', border: '#dedee2' },
    dark: { surface: '#242427', text: '#f4f4f5', background: '#18181b', border: '#414148' },
  },
} as const
export function systemTypeStyles(s: DesignSystem) {
  return [
    { name: 'Display', size: Math.round(s.baseSize * s.typeRatio ** 6), weight: 600 },
    { name: 'Heading 1', size: Math.round(s.baseSize * s.typeRatio ** 5), weight: 600 },
    { name: 'Heading 2', size: Math.round(s.baseSize * s.typeRatio ** 3), weight: 600 },
    { name: 'Heading 3', size: Math.round(s.baseSize * s.typeRatio ** 2), weight: 500 },
    { name: 'Body', size: s.baseSize, weight: 400 },
    { name: 'Label', size: Math.round(s.baseSize / s.typeRatio), weight: 500 },
  ]
}
export function systemShadow(s: DesignSystem) {
  return {
    none: 'none',
    soft: '0 2px 8px rgb(0 0 0 / 0.08)',
    raised: '0 8px 28px rgb(0 0 0 / 0.16)',
  }[s.elevation]
}
export function exportCSS(s: DesignSystem) {
  const scale = (name: string, hex: string) =>
    palette(hex).map((p) => `  --color-${name}-${p.step}: ${p.color};`)
  const surfaces = (mode: 'light' | 'dark') =>
    Object.entries(neutralPalettes[s.neutral][mode])
      .map(([name, value]) => `  --color-${name}: ${value};`)
      .join('\n')
  const url = fontStylesheet([s.font, s.headingFont])
  return `${url ? `@import url("${url}");\n\n` : ''}:root {\n${[
    ...scale('primary', s.primary),
    ...scale('secondary', s.secondary),
    ...Object.entries(s.feedback).flatMap(([name, hex]) => scale(name, hex)),
    ...scale('neutral', neutralBase(s)),
    `  --color-primary: ${s.primary};`,
    `  --color-on-primary: ${foreground(s.primary)};`,
    `  --color-secondary: ${s.secondary};`,
    `  --color-on-secondary: ${foreground(s.secondary)};`,
    `  --font-family: ${fontFamily(s.font)};`,
    `  --font-heading: ${fontFamily(s.headingFont)};`,
    ...Object.entries({ neutral: neutralBase(s), ...s.feedback }).map(
      ([name, hex]) => `  --color-${name}: ${hex};`,
    ),
    ...systemTypeStyles(s).flatMap((t) => [
      `  --type-${t.name.toLowerCase().replaceAll(' ', '-')}-size: ${t.size / 16}rem;`,
      `  --type-${t.name.toLowerCase().replaceAll(' ', '-')}-weight: ${t.weight};`,
    ]),
    `  --radius: ${s.radius}px;`,
    `  --shadow: ${systemShadow(s)};`,
    ...[1, 2, 3, 4, 6, 8, 12, 16].map((n) => `  --space-${n}: ${n * s.spacing}px;`),
    motionDeclarations(s.motion),
    surfaces('light'),
    declarations(uiTokens(s, 'light')),
    declarations(componentAliases),
    '  --radius-sm: ' + Math.round(s.radius / 2) + 'px;',
    '  --radius-lg: ' + Math.round(s.radius * 1.5) + 'px;',
    '  --line-height-body: 1.6;\n  --line-height-heading: 1.15;\n  --border-width: 1px;\n  --opacity-disabled: 0.48;',
  ].join(
    '\n',
  )}\n}\n\n[data-theme="dark"] {\n${surfaces('dark')}\n${declarations(uiTokens(s, 'dark'))}\n}\n\n${reducedMotionCSS}\n`
}
export function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function neutralBase(s: DesignSystem) {
  return { stone: '#78766c', slate: '#718198', zinc: '#77777f' }[s.neutral]
}
export function colorFamilies(s: DesignSystem) {
  return { primary: s.primary, secondary: s.secondary, neutral: neutralBase(s), ...s.feedback }
}
function luminance(hex: string) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
}
export function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
function readable(seed: string, background: string, ratio = 4.5) {
  const candidates = [seed, ...palette(seed).map((p) => p.color)]
  return candidates.find((color) => contrast(color, background) >= ratio) ?? foreground(background)
}
export function uiTokens(s: DesignSystem, mode: 'light' | 'dark'): Record<string, string> {
  const n = neutralPalettes[s.neutral][mode],
    dark = mode === 'dark'
  const roles: Record<string, string> = {
    'surface-canvas': n.background,
    'surface-default': n.surface,
    'surface-subtle': mix(neutralBase(s), dark ? 0 : 255, dark ? 0.65 : 0.94),
    'text-primary': n.text,
    'text-secondary': readable(neutralBase(s), n.surface),
    'border-default': n.border,
    'border-strong': readable(neutralBase(s), n.surface, 3),
    'action-primary': s.primary,
    'action-primary-hover': mix(s.primary, foreground(s.primary) === '#000000' ? 255 : 0, 0.1),
    'action-primary-active': mix(s.primary, foreground(s.primary) === '#000000' ? 255 : 0, 0.18),
    'action-on-primary': foreground(s.primary),
    'text-link': readable(s.primary, n.surface),
    'focus-ring': readable(s.primary, n.surface, 3),
    'surface-disabled': n.background,
    'text-disabled': neutralBase(s),
  }
  for (const role of feedbackRoles) {
    const hex = s.feedback[role],
      surface = mix(hex, dark ? 0 : 255, dark ? 0.78 : 0.94)
    roles[`${role}-surface`] = surface
    roles[`${role}-text`] = readable(hex, surface)
    roles[`${role}-border`] = readable(hex, surface, 3)
    roles[`${role}-solid`] = hex
    roles[`${role}-on-solid`] = foreground(hex)
  }
  return roles
}
export const componentAliases: Record<string, string> = {
  'button-background': 'var(--action-primary)',
  'button-text': 'var(--action-on-primary)',
  'button-hover': 'var(--action-primary-hover)',
  'button-active': 'var(--action-primary-active)',
  'input-background': 'var(--surface-default)',
  'input-text': 'var(--text-primary)',
  'input-border': 'var(--border-strong)',
  'input-invalid': 'var(--error-border)',
  'card-background': 'var(--surface-default)',
  'card-border': 'var(--border-default)',
  'dialog-background': 'var(--surface-default)',
}
function declarations(tokens: Record<string, string>) {
  return Object.entries(tokens)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n')
}
