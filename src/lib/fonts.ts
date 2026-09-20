export const fontCatalog = [
  {
    name: 'DM Sans',
    category: 'Sans serif',
    note: 'Neutral interface text',
    weights: '400;500;600;700',
  },
  {
    name: 'Space Grotesk',
    category: 'Sans serif',
    note: 'Distinctive geometric headings',
    weights: '400;500;600;700',
  },
  {
    name: 'Inter',
    category: 'Sans serif',
    note: 'Compact product interfaces',
    weights: '400;500;600;700',
  },
  {
    name: 'Manrope',
    category: 'Sans serif',
    note: 'Open, rounded letterforms',
    weights: '400;500;600;700',
  },
  {
    name: 'Plus Jakarta Sans',
    category: 'Sans serif',
    note: 'Geometric with a human touch',
    weights: '400;500;600;700',
  },
  {
    name: 'Outfit',
    category: 'Sans serif',
    note: 'Bold display and short headings',
    weights: '400;500;600;700',
  },
  {
    name: 'Nunito Sans',
    category: 'Sans serif',
    note: 'Soft, approachable body text',
    weights: '400;500;600;700',
  },
  {
    name: 'Source Sans 3',
    category: 'Sans serif',
    note: 'Long-form interface reading',
    weights: '400;500;600;700',
  },
  {
    name: 'Lora',
    category: 'Serif',
    note: 'Editorial headings and reading',
    weights: '400;500;600;700',
  },
  {
    name: 'Libre Baskerville',
    category: 'Serif',
    note: 'Traditional editorial contrast',
    weights: '400;700',
  },
  {
    name: 'Cormorant Garamond',
    category: 'Serif',
    note: 'Expressive display typography',
    weights: '400;500;600;700',
  },
  {
    name: 'IBM Plex Mono',
    category: 'Monospace',
    note: 'Technical text and data',
    weights: '400;500;600;700',
  },
  { name: 'system-ui', category: 'System', note: 'Device font; no download', weights: '' },
] as const
export type FontFamily = (typeof fontCatalog)[number]['name']
export const fonts: FontFamily[] = fontCatalog.map((font) => font.name)
export function fontFamily(font: FontFamily) {
  const item = fontCatalog.find((item) => item.name === font)
  return font === 'system-ui'
    ? 'system-ui, sans-serif'
    : `'${font}', ${item?.category === 'Serif' ? 'serif' : item?.category === 'Monospace' ? 'monospace' : 'sans-serif'}`
}
export function fontStylesheet(families: FontFamily[]) {
  const query = [...new Set(families)]
    .filter((name) => name !== 'system-ui')
    .map((name) => {
      const font = fontCatalog.find((font) => font.name === name)!
      return `family=${encodeURIComponent(name).replaceAll('%20', '+')}:wght@${font.weights}`
    })
    .join('&')
  return query ? `https://fonts.googleapis.com/css2?${query}&display=swap` : ''
}
export function loadFont(name: FontFamily) {
  if (
    name === 'system-ui' ||
    typeof document === 'undefined' ||
    document.querySelector(`link[data-bloom-font="${name}"]`)
  )
    return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = fontStylesheet([name])
  link.dataset.bloomFont = name
  document.head.append(link)
}
