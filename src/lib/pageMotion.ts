// Only marked layout groups unfold into individual surfaces. Controls and the
// contents of a card move together, without nested or scroll-triggered animation.
export function pageCascadeTargets(page: HTMLElement): HTMLElement[] {
  return Array.from(page.children).flatMap((child) => {
    const element = child as HTMLElement
    return element.hasAttribute('data-page-cascade') ? pageCascadeTargets(element) : [element]
  })
}

export function animatePageCascade(
  targets: HTMLElement[],
  duration: number,
  done: () => void,
): () => void {
  const animations: Animation[] = []
  let settled = false
  const finish = () => {
    if (settled) return
    settled = true
    // Release fill effects so hover transforms, sticky children, and future
    // interaction are governed by their own styles again.
    animations.forEach((animation) => animation.cancel())
    done()
  }
  if (duration <= 0) {
    finish()
    return finish
  }
  const factor = duration / 320
  targets.forEach((target, index) => {
    if (typeof target.animate !== 'function') return
    animations.push(
      target.animate(
        [
          { opacity: 0, translate: `0 ${index === 0 ? 6 : 14}px` },
          { opacity: 1, translate: '0 0' },
        ],
        {
          duration,
          delay: Math.min(index * 40, 160) * factor,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      ),
    )
  })
  // Cancellations are expected when someone navigates again mid-cascade.
  void Promise.allSettled(animations.map((animation) => animation.finished)).then(finish)
  return finish
}
