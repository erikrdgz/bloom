import { foreground, type DesignSystem } from './system'

export const componentKinds = [
  'button',
  'input',
  'textarea',
  'select',
  'badge',
  'card',
  'alert',
  'switch',
  'checkbox',
  'tabs',
  'tooltip',
  'progress',
] as const
export type ComponentKind = (typeof componentKinds)[number]
export const componentLabels: Record<ComponentKind, string> = {
  button: 'Button',
  input: 'Text input',
  textarea: 'Text area',
  select: 'Select',
  badge: 'Badge',
  card: 'Card',
  alert: 'Alert',
  switch: 'Switch',
  checkbox: 'Checkbox',
  tabs: 'Tabs',
  tooltip: 'Tooltip',
  progress: 'Progress',
}
export interface ComponentStyle {
  background: string
  color: string
  borderColor: string
  borderStyle: 'solid' | 'dashed' | 'dotted'
  borderWidth: number
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
  paddingX: number
  paddingY: number
  fontSize: number
  shadowY: number
  shadowBlur: number
  shadowOpacity: number
  shadowColor: string
  glowBlur: number
  glowOpacity: number
  glowColor: string
}
export interface SavedComponent {
  id: string
  kind: ComponentKind
  name: string
  label: string
  style: ComponentStyle
  linkedTo?: string
  buttonRole?: 'primary' | 'secondary' | 'quiet' | 'danger'
}
export const numericControls = {
  topLeft: { label: 'Top left', min: 0, max: 100 },
  topRight: { label: 'Top right', min: 0, max: 100 },
  bottomRight: { label: 'Bottom right', min: 0, max: 100 },
  bottomLeft: { label: 'Bottom left', min: 0, max: 100 },
  borderWidth: { label: 'Border width', min: 0, max: 12 },
  paddingX: { label: 'Horizontal padding', min: 0, max: 48 },
  paddingY: { label: 'Vertical padding', min: 0, max: 40 },
  fontSize: { label: 'Text size', min: 10, max: 32 },
  shadowY: { label: 'Shadow offset', min: -24, max: 40 },
  shadowBlur: { label: 'Shadow blur', min: 0, max: 64 },
  shadowOpacity: { label: 'Shadow opacity', min: 0, max: 100 },
  glowBlur: { label: 'Glow spread', min: 0, max: 64 },
  glowOpacity: { label: 'Glow opacity', min: 0, max: 100 },
} as const
export type NumericControl = keyof typeof numericControls
export function makeComponent(kind: ComponentKind, system: DesignSystem): SavedComponent {
  const solid = ['button', 'badge', 'switch', 'checkbox', 'tabs', 'progress'].includes(kind)
  const r = kind === 'badge' || kind === 'switch' ? 24 : system.radius
  return {
    id: crypto.randomUUID(),
    kind,
    name: `${componentLabels[kind]} / Default`,
    label: {
      button: 'Make it happen',
      input: 'Your name',
      textarea: 'A little room for ideas…',
      select: 'Choose an option',
      badge: 'In the making',
      card: 'Room for a new idea',
      alert: 'You’re all set.',
      switch: 'Notifications',
      checkbox: 'Keep me in the loop',
      tabs: 'Overview',
      tooltip: 'A little helpful context',
      progress: 'Work in progress',
    }[kind],
    style: {
      background: solid ? system.primary : '#ffffff',
      color: solid ? foreground(system.primary) : '#202936',
      borderColor: solid ? system.primary : '#cbd3dd',
      borderStyle: 'solid',
      borderWidth: 1,
      topLeft: r,
      topRight: r,
      bottomRight: r,
      bottomLeft: r,
      paddingX: kind === 'badge' ? 12 : 20,
      paddingY: kind === 'badge' ? 6 : 12,
      fontSize: system.baseSize,
      shadowY: 4,
      shadowBlur: 12,
      shadowOpacity: 0,
      shadowColor: '#17212c',
      glowBlur: 0,
      glowOpacity: 25,
      glowColor: system.primary,
    },
  }
}
export function componentStyle(s: ComponentStyle): Record<string, string> {
  const alpha = (n: number) =>
    Math.round(n * 2.55)
      .toString(16)
      .padStart(2, '0')
  return {
    background: s.background,
    color: s.color,
    border: `${s.borderWidth}px ${s.borderStyle} ${s.borderColor}`,
    borderRadius: `${s.topLeft}px ${s.topRight}px ${s.bottomRight}px ${s.bottomLeft}px`,
    padding: `${s.paddingY}px ${s.paddingX}px`,
    fontSize: `${s.fontSize}px`,
    boxShadow: `0 ${s.shadowY}px ${s.shadowBlur}px ${s.shadowColor}${alpha(s.shadowOpacity)}, 0 0 ${s.glowBlur}px ${s.glowColor}${alpha(s.glowOpacity)}`,
  }
}
export function componentCSS(component: SavedComponent) {
  return `.bloom-component-${component.id} {\n${Object.entries(componentStyle(component.style))
    .map(([key, value]) => `  ${key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}: ${value};`)
    .join('\n')}\n}`
}
export const presets = ['System', 'Outline', 'Soft shadow', 'Hard shadow', 'Glow'] as const
export function applyPreset(
  component: SavedComponent,
  preset: (typeof presets)[number],
  system: DesignSystem,
): ComponentStyle {
  const base = makeComponent(component.kind, system).style
  if (preset === 'Outline')
    return {
      ...base,
      background: '#ffffff',
      color: '#202936',
      borderColor: system.primary,
      borderWidth: 2,
    }
  if (preset === 'Soft shadow') return { ...base, shadowY: 8, shadowBlur: 24, shadowOpacity: 18 }
  if (preset === 'Hard shadow')
    return {
      ...base,
      topLeft: 2,
      topRight: 2,
      bottomLeft: 2,
      bottomRight: 2,
      borderColor: '#202936',
      shadowY: 5,
      shadowBlur: 0,
      shadowOpacity: 100,
    }
  if (preset === 'Glow') return { ...base, glowBlur: 28, glowOpacity: 65 }
  return base
}
export function parseComponents(value: unknown): SavedComponent[] {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > 500)
    throw new Error('Components must be a list of at most 500 saved variants.')
  const ids = new Set<string>()
  const result: SavedComponent[] = value.map((raw) => {
    if (!raw || typeof raw !== 'object') throw new Error('Invalid saved component.')
    const c = raw as SavedComponent
    if (typeof c.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(c.id) || ids.has(c.id))
      throw new Error('Component IDs must be unique and contain only letters, numbers, or hyphens.')
    ids.add(c.id)
    if (!componentKinds.includes(c.kind)) throw new Error('Unsupported component type.')
    if (typeof c.name !== 'string' || !c.name.trim() || c.name.length > 60)
      throw new Error('Component names must contain 1–60 characters.')
    if (typeof c.label !== 'string' || !c.label.trim() || c.label.length > 120)
      throw new Error('Component text must contain 1–120 characters.')
    if (!c.style || typeof c.style !== 'object') throw new Error('Missing component style.')
    const style = {} as ComponentStyle
    for (const key of ['background', 'color', 'borderColor', 'shadowColor', 'glowColor'] as const) {
      if (typeof c.style[key] !== 'string' || !/^#[0-9a-f]{6}$/i.test(c.style[key]))
        throw new Error(`Invalid component ${key}.`)
      style[key] = c.style[key].toLowerCase()
    }
    for (const key of Object.keys(numericControls) as NumericControl[]) {
      const n = c.style[key],
        range = numericControls[key]
      if (!Number.isInteger(n) || n < range.min || n > range.max)
        throw new Error(`Invalid component ${range.label.toLowerCase()}.`)
      style[key] = n
    }
    if (!['solid', 'dashed', 'dotted'].includes(c.style.borderStyle))
      throw new Error('Invalid component border style.')
    style.borderStyle = c.style.borderStyle
    if (
      c.linkedTo !== undefined &&
      (typeof c.linkedTo !== 'string' || !c.linkedTo || c.linkedTo === c.id)
    )
      throw new Error('Invalid component link.')
    if (
      c.buttonRole !== undefined &&
      (c.kind !== 'button' || !['primary', 'secondary', 'quiet', 'danger'].includes(c.buttonRole))
    )
      throw new Error('Invalid system button role.')
    return {
      id: c.id,
      kind: c.kind,
      name: c.name.trim(),
      label: c.label.trim(),
      style,
      ...(c.linkedTo ? { linkedTo: c.linkedTo } : {}),
      ...(c.buttonRole ? { buttonRole: c.buttonRole } : {}),
    }
  })
  const roles = new Set<string>()
  for (const component of result) {
    if (component.buttonRole) {
      if (roles.has(component.buttonRole)) throw new Error('System button roles must be unique.')
      roles.add(component.buttonRole)
    }
    const seen = new Set([component.id])
    let current = component
    while (current.linkedTo) {
      const parent = result.find((c) => c.id === current.linkedTo)
      if (!parent || parent.kind !== component.kind || seen.has(parent.id))
        throw new Error('Component links must reference the same type and cannot form a cycle.')
      seen.add(parent.id)
      current = parent
    }
  }
  return result
}

// Linked variants retain their color roles; all other appearance values follow their source.
export function resolveComponent(
  component: SavedComponent,
  components: SavedComponent[],
): SavedComponent {
  const chain: SavedComponent[] = [component]
  const seen = new Set([component.id])
  let current = component
  while (current.linkedTo) {
    const parent = components.find((c) => c.id === current.linkedTo)
    if (!parent || seen.has(parent.id)) break
    chain.push(parent)
    seen.add(parent.id)
    current = parent
  }
  let style = { ...current.style }
  for (const child of chain.slice(0, -1).reverse()) {
    style = {
      ...style,
      background: child.style.background,
      color: child.style.color,
      borderColor: child.style.borderColor,
    }
  }
  return { ...component, style }
}
export function saveComponentToSystem(system: DesignSystem, value: SavedComponent): DesignSystem {
  const component = JSON.parse(JSON.stringify(value)) as SavedComponent
  let components = [...system.components]
  const primary = components.find((c) => c.buttonRole === 'primary')
  if (component.kind === 'button' && !primary && !component.buttonRole && !component.linkedTo)
    component.buttonRole = 'primary'
  if (component.buttonRole === 'primary' && primary && primary.id !== component.id) {
    components = components.map((c) => {
      const updated = { ...c }
      if (updated.id === primary.id) delete updated.buttonRole
      if (updated.linkedTo === primary.id) updated.linkedTo = component.id
      return updated
    })
  }
  const index = components.findIndex((c) => c.id === component.id)
  if (index < 0) components.push(component)
  else components[index] = component
  if (component.buttonRole === 'primary') {
    for (const role of ['secondary', 'quiet', 'danger'] as const) {
      if (components.some((c) => c.buttonRole === role)) continue
      const variant = makeComponent('button', system)
      variant.name = `Button / ${role[0]!.toUpperCase() + role.slice(1)}`
      variant.label =
        role === 'danger' ? 'Remove item' : role === 'secondary' ? 'Another way' : 'Maybe later'
      variant.style = {
        ...component.style,
        background: role === 'danger' ? system.feedback.error : '#ffffff',
        color: role === 'danger' ? foreground(system.feedback.error) : '#202936',
        borderColor:
          role === 'quiet'
            ? '#ffffff'
            : role === 'danger'
              ? system.feedback.error
              : component.style.borderColor,
      }
      variant.linkedTo = component.id
      variant.buttonRole = role
      components.push(variant)
    }
  }
  return { ...system, components: parseComponents(components) }
}
export function systemButtonStyle(
  system: DesignSystem,
  role: NonNullable<SavedComponent['buttonRole']>,
): Record<string, string> | undefined {
  const component = system.components.find((c) => c.buttonRole === role)
  return component
    ? componentStyle(resolveComponent(component, system.components).style)
    : undefined
}

export function systemButtonsCSS(system: DesignSystem): string {
  return system.components
    .filter((c) => c.buttonRole)
    .map((c) => {
      const selector =
        c.buttonRole === 'primary'
          ? '.button:not(.secondary):not(.quiet):not(.danger)'
          : `.button.${c.buttonRole}`
      return componentCSS(resolveComponent(c, system.components)).replace(
        `.bloom-component-${c.id}`,
        selector,
      )
    })
    .join('\n\n')
}
