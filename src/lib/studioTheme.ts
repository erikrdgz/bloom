import {
  fontFamily,
  contrast,
  palette,
  foreground,
  neutralPalettes,
  systemShadow,
  uiTokens,
  type DesignSystem,
} from './system'
import { systemButtonStyle } from './builder'

// A fresh, complete token set prevents a previous system's custom appearance leaking
// into the next system. Both foundation edits and component saves use this path.
export function studioTheme(system: DesignSystem, dark: boolean): Record<string, string> {
  const neutral = neutralPalettes[system.neutral][dark ? 'dark' : 'light']
  const factor = { calm: 1.4, standard: 1, snappy: 0.7 }[system.motion]
  const heroSurface = dark ? '#171f2a' : '#edf0f4'
  const shades = palette(system.primary).map((shade) => shade.color)
  // Preserve the brand hue, using a readable shade on each hero surface.
  const heroAccent =
    [system.primary, ...(dark ? shades.reverse() : shades)].find(
      (color) => contrast(color, heroSurface) >= 4.5,
    ) ?? foreground(heroSurface)
  const tokens: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(uiTokens(system, dark ? 'dark' : 'light')).map(([key, value]) => [
        `--${key}`,
        value,
      ]),
    ),
    '--primary': system.primary,
    '--on-primary': foreground(system.primary),
    '--secondary': system.secondary,
    '--hero-accent': heroAccent,
    '--sample-radius': `${system.radius}px`,
    '--sample-space': `${system.spacing}px`,
    '--sample-font': fontFamily(system.font),
    '--heading-font': fontFamily(system.headingFont),
    '--code-font': "'IBM Plex Mono', monospace",
    '--base-size': `${system.baseSize}px`,
    '--system-shadow': systemShadow(system),
    '--bg': neutral.background,
    '--surface': neutral.surface,
    '--sidebar': neutral.background,
    '--text': neutral.text,
    '--muted': dark ? '#a8b0b8' : '#687078',
    '--border': neutral.border,
    '--soft': neutral.background,
    '--ink': neutral.text,
    '--duration-fast': `${Math.round(120 * factor)}ms`,
    '--duration-standard': `${Math.round(200 * factor)}ms`,
    '--duration-deliberate': `${Math.round(320 * factor)}ms`,
  }
  for (const role of ['primary', 'secondary', 'quiet', 'danger'] as const) {
    const fill =
      role === 'primary'
        ? system.primary
        : role === 'danger'
          ? system.feedback.error
          : role === 'quiet'
            ? 'transparent'
            : neutral.surface
    const fallback = {
      background: fill,
      color: ['primary', 'danger'].includes(role) ? foreground(fill) : neutral.text,
      border: `1px solid ${role === 'quiet' ? 'transparent' : role === 'secondary' ? neutral.border : fill}`,
      // Soften shell actions without altering specimens or exported radius tokens.
      // A saved system button below replaces this fallback, including its exact corners.
      borderRadius: `${Math.max(24, system.radius)}px`,
      padding: `${system.spacing * 2.5}px ${system.spacing * 3.25}px`,
      fontSize: `${Math.round(system.baseSize * 0.75)}px`,
      boxShadow: role === 'quiet' ? 'none' : systemShadow(system),
    }
    const style = systemButtonStyle(system, role) ?? fallback
    for (const [key, value] of Object.entries(style)) {
      tokens[`--studio-button-${role}-${key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}`] =
        value
    }
  }
  return tokens
}
