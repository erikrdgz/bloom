import { defaultSystem, type DesignSystem } from './system'
export const directions = [
  {
    id: 'product',
    name: 'Product',
    note: 'Compact interfaces, clear hierarchy, restrained corners.',
    values: {
      primary: '#4164d9',
      secondary: '#238578',
      font: 'Inter',
      headingFont: 'Manrope',
      neutral: 'slate',
      radius: 8,
      spacing: 4,
      baseSize: 16,
      typeRatio: 1.25,
      elevation: 'soft',
      motion: 'standard',
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    note: 'Serif headings, generous reading size, warm surfaces.',
    values: {
      primary: '#923f50',
      secondary: '#667348',
      font: 'Source Sans 3',
      headingFont: 'Lora',
      neutral: 'stone',
      radius: 2,
      spacing: 6,
      baseSize: 18,
      typeRatio: 1.333,
      elevation: 'none',
      motion: 'calm',
    },
  },
  {
    id: 'expressive',
    name: 'Expressive',
    note: 'Geometric headings, stronger color, rounded controls.',
    values: {
      primary: '#d85332',
      secondary: '#7054ba',
      font: 'Nunito Sans',
      headingFont: 'Outfit',
      neutral: 'zinc',
      radius: 18,
      spacing: 5,
      baseSize: 16,
      typeRatio: 1.333,
      elevation: 'raised',
      motion: 'snappy',
    },
  },
] as const
export function newDraft(): DesignSystem {
  return {
    ...defaultSystem,
    feedback: { ...defaultSystem.feedback },
    ...directions[0].values,
    name: '',
    description: '',
    icons: [...defaultSystem.icons],
  }
}
export function applyDirection(system: DesignSystem, id: string): DesignSystem {
  const direction = directions.find((item) => item.id === id)
  if (!direction) throw new Error('Unknown direction')
  return { ...system, ...direction.values }
}
