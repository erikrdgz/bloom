import { describe, expect, it } from 'vitest'
import { iconCatalog, filterIcons, iconSprite, loadIcon, isIconId } from './icons'
import { defaultSystem, parseSystem } from './system'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

describe('free icon library', () => {
  it('covers every unique icon in all three installed packs with safe, distinct IDs', () => {
    const expected = [fas, far, fab].reduce(
      (count, pack) => count + new Set(Object.values(pack).map((icon) => icon.iconName)).size,
      0,
    )
    expect(iconCatalog).toHaveLength(expected)
    expect(new Set(iconCatalog.map((icon) => icon.id)).size).toBe(expected)
    expect(iconCatalog.every((icon) => /^[a-z0-9-]+$/.test(icon.id))).toBe(true)
  })
  it('resolves every catalog entry to the correct style and artwork', async () => {
    for (const metadata of iconCatalog) {
      const icon = await loadIcon(metadata.id)
      expect(icon.iconName).toBe(metadata.name)
      expect(icon.prefix).toBe({ solid: 'fas', regular: 'far', brands: 'fab' }[metadata.family])
      expect(icon.icon[4].length).toBeGreaterThan(0)
    }
  })
  it('round-trips legacy and new selections without collapsing different styles', () => {
    const icons = ['heart', 'far-heart', 'fab-github', 'heart']
    const imported = parseSystem(JSON.stringify({ ...defaultSystem, icons }))
    expect(imported.icons).toEqual(['heart', 'far-heart', 'fab-github'])
    expect(
      parseSystem(JSON.stringify({ ...defaultSystem, icons: iconCatalog.map((icon) => icon.id) }))
        .icons,
    ).toHaveLength(iconCatalog.length)
  })
  it('searches aliases and intersects style and selection filters', () => {
    expect(filterIcons('COG', 'solid').some((icon) => icon.id === 'gear')).toBe(true)
    expect(
      filterIcons('heart', 'regular', new Set(['heart', 'far-heart', 'fab-github'])).map(
        (icon) => icon.id,
      ),
    ).toEqual(['far-heart'])
    expect(filterIcons('not-an-icon-xyz', 'all')).toEqual([])
  })
  it('exports distinct SVG symbols and attribution for selections across packs', async () => {
    const sprite = await iconSprite(['heart', 'far-heart', 'fab-github', 'heart'])
    expect(sprite.match(/<symbol /g)).toHaveLength(3)
    for (const id of ['heart', 'far-heart', 'fab-github']) expect(sprite).toContain(`id="${id}"`)
    const solid = await loadIcon('heart')
    const regular = await loadIcon('far-heart')
    expect(solid.icon[4]).not.toBe(regular.icon[4])
    expect(sprite).toContain('CC BY 4.0')
    expect(sprite).toContain('trademarks')
    expect(sprite).not.toContain('fill=')
  })
  it('rejects unknown or unsafe identifiers before import or export', async () => {
    for (const id of ['fal-heart', 'unknown', '\"><script>']) {
      expect(isIconId(id)).toBe(false)
      expect(() => parseSystem(JSON.stringify({ ...defaultSystem, icons: [id] }))).toThrow(
        'unsupported',
      )
      await expect(iconSprite([id])).rejects.toThrow('Unsupported')
    }
  })
})
