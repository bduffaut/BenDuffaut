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
const spotlight: Directive<HTMLElement> = {
  mounted(el) {
    let frame = 0
    let last: PointerEvent | null = null

    const panels = () => (el.classList.contains('panel') ? [el] : Array.from(el.querySelectorAll<HTMLElement>('.panel')))

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

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', reveal)
  nuxtApp.vueApp.directive('spotlight', spotlight)

  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => {
      document.documentElement.classList.add('hydrated')
    })
  }
})
