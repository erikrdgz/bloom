export const durations = [
  { name: 'instant', value: 0, use: 'Direct input, dragging, reduced motion' },
  { name: 'fast', value: 120, use: 'Hover, focus, switch feedback' },
  { name: 'standard', value: 200, use: 'Small panels and inline state changes' },
  { name: 'deliberate', value: 320, use: 'Dialogs and larger surface transitions' },
] as const
export const easings = [
  { name: 'standard', value: 'cubic-bezier(0.2, 0, 0, 1)', use: 'Movement within the interface' },
  { name: 'enter', value: 'cubic-bezier(0, 0, 0.2, 1)', use: 'New content settling into place' },
  { name: 'exit', value: 'cubic-bezier(0.4, 0, 1, 1)', use: 'Content leaving the interface' },
  { name: 'linear', value: 'linear', use: 'Continuous progress' },
] as const
export function motionDeclarations(profile: 'calm' | 'standard' | 'snappy' = 'standard') {
  const factor = { calm: 1.4, standard: 1, snappy: 0.7 }[profile]
  return [
    ...durations.map(
      (token) => `  --duration-${token.name}: ${Math.round(token.value * factor)}ms;`,
    ),
    ...easings.map((token) => `  --ease-${token.name}: ${token.value};`),
  ].join('\n')
}
export const reducedMotionCSS = `@media (prefers-reduced-motion: reduce) {
  :root {
${durations.map((token) => `    --duration-${token.name}: 0ms;`).join('\n')}
  }
}`
