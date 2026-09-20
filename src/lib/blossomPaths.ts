import { blossoms } from './blossoms'

// Bake each flower's transform once and batch by depth and shade.
// CSS colors remain live; Vue no longer manages thousands of SVG instances.
function flowerPath(f: (typeof blossoms)[number]) {
  const point = (x: number, y: number, petal = 0) => {
    const p = (petal * Math.PI) / 180
    const px = (x * Math.cos(p) - y * Math.sin(p)) * f.size
    const py = (x * Math.sin(p) + y * Math.cos(p)) * f.size * f.aspect
    const a = (f.angle * Math.PI) / 180
    return `${(f.x + px * Math.cos(a) - py * Math.sin(a)).toFixed(2)} ${(f.y + px * Math.sin(a) + py * Math.cos(a)).toFixed(2)}`
  }
  if (f.bud)
    return `M${point(0, -0.8)}C${point(0.67, -0.8)} ${point(0.67, 0.8)} ${point(0, 0.8)}C${point(-0.67, 0.8)} ${point(-0.67, -0.8)} ${point(0, -0.8)}Z`
  return [0, 72, 144, 216, 288]
    .map(
      (p) =>
        `M${point(0, 0.1, p)}C${point(-0.35, -0.2, p)} ${point(-0.72, -0.58, p)} ${point(-0.48, -0.92, p)}Q${point(-0.25, -1.14, p)} ${point(0, -0.82, p)}Q${point(0.27, -1.14, p)} ${point(0.49, -0.88, p)}C${point(0.72, -0.53, p)} ${point(0.32, -0.18, p)} ${point(0, 0.1, p)}Z`,
    )
    .join('')
}
export const blossomPaths = [true, false].flatMap((rear) => {
  const groups = Array.from({ length: 7 }, () => [] as string[])
  for (const flower of blossoms) {
    if (flower.rear !== rear) continue
    groups[rear ? Math.max(0, flower.tone - 1) : flower.tone]!.push(flowerPath(flower))
  }
  return groups.flatMap((paths, tone) => (paths.length ? [{ rear, tone, d: paths.join('') }] : []))
})
