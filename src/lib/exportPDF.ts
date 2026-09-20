import { jsPDF } from 'jspdf'
import {
  colorFamilies,
  palette,
  uiTokens,
  systemTypeStyles,
  contrast,
  componentAliases,
  type DesignSystem,
} from './system'
import { durations } from './motion'
export function createSystemPDF(s: DesignSystem) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const safe = (text: string) =>
    text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7e\n]/g, ' ')
  let y = 0
  function text(value: string, x: number, yy: number, size = 10, color = '#283447') {
    doc.setTextColor(color)
    doc.setFontSize(size)
    doc.text(safe(value), x, yy)
  }
  function page(title: string, subtitle: string) {
    if (y) doc.addPage()
    doc.setFillColor('#f3f5f8')
    doc.rect(0, 0, 210, 297, 'F')
    doc.setFillColor(s.primary)
    doc.rect(18, 18, 12, 3, 'F')
    text(s.name, 18, 33, 12)
    text(title, 18, 51, 24)
    text(subtitle, 18, 62, 9, '#59697c')
    y = 78
  }
  function row(label: string, value: string, height = 12) {
    doc.setDrawColor('#d6dde7')
    doc.line(18, y + 4, 192, y + 4)
    text(label, 18, y, 9)
    text(value, 111, y, 9)
    y += height
  }
  page('Design system reference', 'Foundations, semantic roles, and component decisions.')
  doc.setFontSize(12)
  text(
    doc
      .splitTextToSize(safe(s.description || 'A starting point for your next project.'), 170)
      .join('\n'),
    18,
    84,
    12,
  )
  y = 114
  row('Color families', '7 palettes / 70 shades')
  row('Appearances', 'Light and dark')
  row('Heading font', s.headingFont)
  row('Body font', s.font)
  row('Base size / ratio', `${s.baseSize}px / ${s.typeRatio}`)
  row('Spacing / radius', `${s.spacing}px / ${s.radius}px`)
  row('Motion profile', s.motion)
  text('Use the code ZIP for implementation and Bloom JSON for editing.', 18, 227, 10)
  text('This PDF uses Helvetica for portable reference text.', 18, 238, 9)
  text('Font names and type sizes describe your selected system.', 18, 244, 9)
  page('Color foundations', 'Primitives are values. Use semantic roles when building interfaces.')
  for (const [name, hex] of Object.entries(colorFamilies(s))) {
    text(name.toUpperCase(), 18, y, 10)
    text(hex, 170, y, 9)
    y += 5
    palette(hex).forEach((p, i) => {
      doc.setFillColor(p.color)
      doc.rect(18 + i * 17.4, y, 17.4, 12, 'F')
      text(String(p.step), 19 + i * 17.4, y + 18, 7)
    })
    y += 24
  }
  for (const mode of ['light', 'dark'] as const) {
    page(
      `${mode === 'light' ? 'Light' : 'Dark'} UI roles`,
      'Semantic roles connect foundations to actual interface decisions.',
    )
    const t = uiTokens(s, mode)
    for (const key of [
      'surface-canvas',
      'surface-default',
      'surface-subtle',
      'text-primary',
      'text-secondary',
      'border-strong',
      'action-primary',
      'action-primary-hover',
      'text-link',
      'focus-ring',
    ]) {
      doc.setFillColor(t[key]!)
      doc.rect(18, y - 4, 6, 6, 'F')
      text(key, 28, y, 9)
      text(t[key]!, 155, y, 9)
      y += 10
    }
    y += 7
    for (const role of ['success', 'warning', 'error', 'info']) {
      doc.setFillColor(t[`${role}-surface`]!)
      doc.setDrawColor(t[`${role}-border`]!)
      doc.roundedRect(18, y, 174, 18, 2, 2, 'FD')
      text(`${role.toUpperCase()}   ${t[`${role}-text`]}`, 23, y + 7, 10, t[`${role}-text`])
      text(
        `Text contrast ${contrast(t[`${role}-text`]!, t[`${role}-surface`]!).toFixed(2)}:1`,
        23,
        y + 13,
        8,
        t[`${role}-text`],
      )
      y += 21
    }
  }
  page(
    'Typography and rhythm',
    'Use consistent hierarchy, spacing, and motion across every component.',
  )
  for (const type of systemTypeStyles(s)) row(type.name, `${type.size}px / weight ${type.weight}`)
  y += 10
  row('Heading line height', '1.15')
  row('Body line height', '1.6')
  row('Spacing scale', [1, 2, 3, 4, 6, 8, 12, 16].map((n) => n * s.spacing).join(', ') + ' px')
  row('Corner radii', `${Math.round(s.radius / 2)}, ${s.radius}, ${Math.round(s.radius * 1.5)} px`)
  const factor = { calm: 1.4, standard: 1, snappy: 0.7 }[s.motion]
  for (const d of durations) row(`Motion / ${d.name}`, `${Math.round(d.value * factor)} ms`)
  page('Component contract', 'Primitive palette > semantic purpose > component application.')
  for (const [name, value] of Object.entries(componentAliases))
    row(name, value.replace('var(--', '').replace(')', ''), 10)
  y += 10
  const notes = [
    'Buttons: primary, secondary, destructive, disabled, hover and focus.',
    'Fields: label, border, focus ring and invalid state.',
    'Feedback: always pair color with a status label or icon.',
    'Cards and dialogs: shared surface, border, radius and elevation.',
    'Code ZIP: tokens.css, components.css, demo, token JSON and README.',
    'Validate actual layouts and interactions before production use.',
  ]
  for (const note of notes) {
    text(note, 18, y, 9)
    y += 9
  }
  for (let n = 1; n <= doc.getNumberOfPages(); n++) {
    doc.setPage(n)
    text('Bloom / ' + s.name, 18, 284, 8, '#657386')
    text(`${n} / ${doc.getNumberOfPages()}`, 181, 284, 8, '#657386')
  }
  return doc
}
