import type { Directive } from 'vue'

// v-reveal fades an element up into place the first time it scrolls into view.
// The value is an optional delay in ms, for staggering siblings: v-reveal="i * 60".
// Styles are in main.css under [data-reveal].
const reveal: Directive<HTMLElement, number | undefined> = {
  getSSRProps(binding) {
    return {
      'data-reveal': '',
      style: binding.value ? { '--reveal-delay': `${binding.value}ms` } : undefined,
    }
  },
  mounted(el, binding) {
    el.dataset.reveal = ''
    if (binding.value) el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.classList.add('is-revealed')
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    observer.observe(el)
    ;(el as RevealElement)._revealObserver = observer
  },
  unmounted(el) {
    ;(el as RevealElement)._revealObserver?.disconnect()
  },
}

type RevealElement = HTMLElement & { _revealObserver?: IntersectionObserver }

// v-spotlight tracks the mouse over a container and gives every .panel inside it
// (or the element itself, if it's a panel) --mx and --my in its own coordinates.
// Neighboring panels light up as the pointer approaches, not only the hovered one.
//
// Touch screens have no pointer to follow, so there the middle of the screen stands in for
// it: a line across the viewport at SCAN_LINE that panels scroll past. Panels near it get
// data-scan, which swaps the round spotlight for a band of light along that line, so their
// edges light up as it passes, and the panel the line is crossing gets data-lit, styled like
// :hover. Off for reduced motion, where panels stay at rest.
const SCAN_LINE = 0.5
const SCAN_REACH = 420 // px beyond the viewport where panels still get painted, matching the glow's size

const spotlight: Directive<HTMLElement> = {
  mounted(el) {
    const panels = () => (el.classList.contains('panel') ? [el] : Array.from(el.querySelectorAll<HTMLElement>('.panel')))

    const touch = matchMedia('(hover: none) and (pointer: coarse)').matches
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (touch && !still) {
      scanOnScroll(el, panels)
      return
    }

    let frame = 0
    let last: PointerEvent | null = null

    const paint = () => {
      frame = 0
      if (!last) return
      for (const panel of panels()) {
        const rect = panel.getBoundingClientRect()
        panel.style.setProperty('--mx', `${last.clientX - rect.left}px`)
        panel.style.setProperty('--my', `${last.clientY - rect.top}px`)
      }
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      last = event
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onLeave = () => {
      last = null
      for (const panel of panels()) {
        panel.style.removeProperty('--mx')
        panel.style.removeProperty('--my')
      }
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    ;(el as SpotlightElement)._spotlightCleanup = () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  },
  unmounted(el) {
    ;(el as SpotlightElement)._spotlightCleanup?.()
  },
}

type SpotlightElement = HTMLElement & { _spotlightCleanup?: () => void }

function scanOnScroll(el: HTMLElement, panels: () => HTMLElement[]) {
  let frame = 0
  const painted = new Set<HTMLElement>()

  const clear = (panel: HTMLElement) => {
    panel.style.removeProperty('--mx')
    panel.style.removeProperty('--my')
    delete panel.dataset.lit
    delete panel.dataset.scan
    painted.delete(panel)
  }

  const paint = () => {
    frame = 0
    const line = window.innerHeight * SCAN_LINE
    const current = panels()
    for (const panel of painted) if (!current.includes(panel)) clear(panel)

    for (const panel of current) {
      const rect = panel.getBoundingClientRect()
      if (rect.bottom < -SCAN_REACH || rect.top > window.innerHeight + SCAN_REACH) {
        if (painted.has(panel)) clear(panel)
        continue
      }
      panel.style.setProperty('--mx', `${rect.width / 2}px`)
      panel.style.setProperty('--my', `${line - rect.top}px`)
      // Only touch the attribute when it changes, so scrolling doesn't restyle every panel each frame
      const lit = rect.top <= line && rect.bottom >= line
      if (lit !== 'lit' in panel.dataset) panel.toggleAttribute('data-lit', lit)
      if (!painted.has(panel)) panel.dataset.scan = ''
      painted.add(panel)
    }
  }

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(paint)
  }

  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  schedule()
  ;(el as SpotlightElement)._spotlightCleanup = () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    for (const panel of painted) clear(panel)
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', reveal)
  nuxtApp.vueApp.directive('spotlight', spotlight)

  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => {
      document.documentElement.classList.add('hydrated')
    })
    // iOS Safari only applies :active (the tap press states in main.css) once the page has a touch listener
    document.addEventListener('touchstart', () => {}, { passive: true })
  }
})
