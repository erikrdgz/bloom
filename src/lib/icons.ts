import type { IconDefinition, IconPack } from '@fortawesome/fontawesome-common-types'
import { iconRows, type IconFamily } from './iconCatalog'
export type { IconFamily }
export const iconFamilies: { id: IconFamily; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'regular', label: 'Regular' },
  { id: 'brands', label: 'Brands' },
]
export const iconCatalog = iconRows.map(([id, family, name, aliases]) => ({
  id,
  family,
  name,
  aliases,
}))
const metadata = new Map(iconCatalog.map((icon) => [icon.id, icon]))
export const iconNames = iconCatalog.map((icon) => icon.id)
export function isIconId(id: string) {
  return metadata.has(id)
}
export function iconLabel(id: string) {
  const icon = metadata.get(id)
  return icon ? `${icon.name.replaceAll('-', ' ')} · ${icon.family}` : id
}
const loaders: Record<IconFamily, () => Promise<IconPack>> = {
  solid: () => import('@fortawesome/free-solid-svg-icons').then((module) => module.fas),
  regular: () => import('@fortawesome/free-regular-svg-icons').then((module) => module.far),
  brands: () => import('@fortawesome/free-brands-svg-icons').then((module) => module.fab),
}
const cache = new Map<IconFamily, Promise<Map<string, IconDefinition>>>()
function loadFamily(family: IconFamily) {
  if (!cache.has(family)) {
    const request = loaders[family]()
      .then((pack) => new Map(Object.values(pack).map((icon) => [icon.iconName, icon])))
      .catch((error) => {
        cache.delete(family)
        throw error
      })
    cache.set(family, request)
  }
  return cache.get(family)!
}
export async function loadIcon(id: string): Promise<IconDefinition> {
  const icon = metadata.get(id)
  if (!icon) throw new Error(`Unsupported icon: ${id}`)
  const definition = (await loadFamily(icon.family)).get(icon.name)
  if (!definition) throw new Error(`Icon unavailable: ${id}`)
  return definition
}
export function iconPaths(icon: IconDefinition): string[] {
  return Array.isArray(icon.icon[4]) ? icon.icon[4] : [icon.icon[4]]
}
export function filterIcons(query: string, family: IconFamily | 'all', selected?: Set<string>) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return iconCatalog.filter((icon) => {
    if (family !== 'all' && icon.family !== family) return false
    if (selected && !selected.has(icon.id)) return false
    const text = `${icon.name} ${icon.aliases.join(' ')}`.replaceAll('-', ' ')
    return words.every((word) => text.includes(word.replaceAll('-', ' ')))
  })
}
export async function iconSprite(ids: string[]): Promise<string> {
  const symbols = await Promise.all(
    [...new Set(ids)].map(async (id) => {
      const icon = await loadIcon(id)
      return `<symbol id="${id}" viewBox="0 0 ${icon.icon[0]} ${icon.icon[1]}">${iconPaths(icon)
        .map((d) => `<path d="${d}"/>`)
        .join('')}</symbol>`
    }),
  )
  return `<!-- Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com\nLicense: CC BY 4.0 (icons) https://creativecommons.org/licenses/by/4.0/\nBrand icons are trademarks of their respective owners. -->\n<svg xmlns="http://www.w3.org/2000/svg"><defs>\n${symbols.join('\n')}\n</defs></svg>`
}
