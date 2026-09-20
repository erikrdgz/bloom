interface Spray {
  x: number
  y: number
  width: number
  height: number
  angle: number
  seed: number
}

// Each spray follows a flowering bough; overlapping edges join them into a canopy.
const sprays: Spray[] = [
  [336, 54, 59, 28, -22],
  [395, 42, 57, 32, 5],
  [443, 58, 37, 27, 24],
  [515, 78, 36, 25, -16],
  [578, 54, 43, 31, -18],
  [621, 76, 44, 30, 18],
  [665, 102, 52, 33, 20],
  [713, 122, 49, 29, 18],
  [754, 167, 37, 26, 40],
  [284, 127, 47, 30, -12],
  [240, 146, 43, 29, -22],
  [190, 152, 49, 30, 8],
  [133, 161, 51, 32, -10],
  [84, 190, 44, 30, -32],
  [59, 222, 30, 24, -15],
  [322, 173, 46, 27, 14],
  [363, 227, 43, 32, 28],
  [404, 257, 42, 29, 20],
  [307, 255, 50, 30, -6],
  [249, 253, 47, 27, 2],
  [199, 272, 42, 28, -18],
  [141, 286, 57, 30, -12],
  [86, 308, 50, 30, -24],
  [191, 332, 41, 26, 4],
  [443, 316, 44, 25, 10],
  [663, 200, 45, 29, -35],
  [704, 278, 48, 35, -30],
  [668, 335, 40, 28, -14],
  [719, 352, 50, 34, 28],
  [761, 376, 41, 26, 18],
].map(([x, y, width, height, angle], seed) => ({
  x: x!,
  y: y!,
  width: width!,
  height: height!,
  angle: angle!,
  seed,
}))

function random(seed: number) {
  let state = seed + 1
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

export const blossoms = sprays.flatMap((spray) => {
  const next = random(spray.seed * 7919)
  const count = Math.round((spray.width * spray.height) / 14)
  const rotation = (spray.angle * Math.PI) / 180
  return Array.from({ length: count }, (_, index) => {
    const angle = next() * Math.PI * 2
    const distance = Math.sqrt(next())
    const edge = 0.88 + 0.12 * Math.sin(angle * 5 + spray.seed) + 0.09 * Math.cos(angle * 3)
    const dx = Math.cos(angle) * distance * spray.width * edge
    const dy = Math.sin(angle) * distance * spray.height * edge
    const light = next()
    return {
      id: `${spray.seed}-${index}`,
      x: spray.x + dx * Math.cos(rotation) - dy * Math.sin(rotation),
      y: spray.y + dx * Math.sin(rotation) + dy * Math.cos(rotation),
      size: 2.8 + next() * 2.6,
      angle: next() * 360,
      aspect: 0.72 + next() * 0.28,
      tone: Math.min(6, Math.max(0, Math.floor(light * 5 + (1 - dy / spray.height) * 1.2))),
      bud: next() < 0.07,
      rear: index % 4 === 0,
    }
  })
})
