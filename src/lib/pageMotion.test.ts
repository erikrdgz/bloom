import { describe, expect, it, vi } from 'vitest'
import { parseHTML } from 'linkedom'
import { animatePageCascade, pageCascadeTargets } from './pageMotion'

function surface() {
  let resolve!: () => void
  let reject!: () => void
  const finished = new Promise<void>((yes, no) => {
    resolve = yes
    reject = () => no(new Error('Animation cancelled'))
  })
  const cancel = vi.fn(reject)
  const animate = vi.fn(() => ({ finished, cancel }))
  return { element: { animate } as unknown as HTMLElement, animate, cancel, resolve }
}

describe('page navigation motion', () => {
  it('unfolds marked groups in reading order without animating nested controls', () => {
    const { document } = parseHTML(`<main><section id="hero"><button>Explore</button></section>
      <div data-page-cascade><article id="first"></article>
      <div data-page-cascade><article id="second"></article></div></div></main>`)
    expect(pageCascadeTargets(document.querySelector('main')!).map((item) => item.id)).toEqual([
      'hero',
      'first',
      'second',
    ])
  })

  it('cancels an interrupted cascade immediately and completes only once', async () => {
    const items = [surface(), surface()]
    const done = vi.fn()
    const stop = animatePageCascade(
      items.map((item) => item.element),
      320,
      done,
    )
    stop()
    stop()
    await Promise.resolve()
    expect(items.every((item) => item.cancel.mock.calls.length === 1)).toBe(true)
    expect(done).toHaveBeenCalledTimes(1)
  })

  it('releases animation effects after the last surface settles', async () => {
    const item = surface()
    const done = vi.fn()
    animatePageCascade([item.element], 320, done)
    item.resolve()
    await vi.waitFor(() => expect(done).toHaveBeenCalledTimes(1))
    expect(item.cancel).toHaveBeenCalledTimes(1)
  })

  it('does not queue motion or delay completion for reduced motion', () => {
    const item = surface()
    const done = vi.fn()
    animatePageCascade([item.element], 0, done)
    expect(item.animate).not.toHaveBeenCalled()
    expect(done).toHaveBeenCalledTimes(1)
  })

  it('caps stagger delay on dense pages and scales with the motion profile', () => {
    const items = Array.from({ length: 30 }, surface)
    const stop = animatePageCascade(
      items.map((item) => item.element),
      448,
      vi.fn(),
    )
    const timings = items.map(
      (item) => item.animate.mock.calls[0] as unknown as [Keyframe[], KeyframeAnimationOptions],
    )
    expect(timings[0]![1].delay).toBe(0)
    expect(timings[1]![1].delay).toBe(56)
    expect(timings[29]![1].delay).toBe(224)
    expect(timings[29]![1].duration).toBe(448)
    stop()
  })
})
