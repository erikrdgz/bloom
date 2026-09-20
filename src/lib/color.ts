export function normalizeHex(value: string): string | null {
  const hex = value.trim().replace(/^#/, '')
  if (/^[\da-f]{3}$/i.test(hex))
    return (
      '#' +
      [...hex]
        .map((c) => c + c)
        .join('')
        .toLowerCase()
    )
  return /^[\da-f]{6}$/i.test(hex) ? '#' + hex.toLowerCase() : null
}
export function hexToHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ]
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    l = (max + min) / 2
  let h = 0
  if (d)
    h =
      (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) *
      60
  return { h, s: d ? (d / (1 - Math.abs(2 * l - 1))) * 100 : 0, l: l * 100 }
}
export function hslToHex(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
      .toString(16)
      .padStart(2, '0')
  }
  return '#' + channel(0) + channel(8) + channel(4)
}
