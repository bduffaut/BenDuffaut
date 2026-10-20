// Runs one animated backdrop on the fixed canvas behind every page (components/site/SiteField.vue).
// The runner owns the plumbing every effect needs: sizing for the screen's pixel density, the
// pointer, the frame loop and its timing, and cleanup. An effect only draws, see ./index.ts.
//
// Smoothness: frames run at the display's own rate. The runner measures how long drawing takes,
// and only if a device can't keep up does it halve the rate, stepping back up when it recovers.
// Effects get the elapsed time (dt) to move by, so motion is the same speed at any rate, and a
// smoothed pointer to follow, so nothing jitters with the mouse's individual events.

export interface Pointer {
  /* Where the mouse is now */
  x: number
  y: number
  /* Where it is, eased: follow this for anything that tracks the cursor */
  sx: number
  sy: number
  /* performance.now() of the last mouse move, -Infinity once it leaves the page */
  movedAt: number
}

export interface Frame {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  /* performance.now() of this frame */
  now: number
  /* Seconds since the last frame, capped so a background tab coming back doesn't jump */
  dt: number
  pointer: Pointer
}

export interface Backdrop {
  /* Draws one frame on a cleared canvas. Return true to keep animating, false to sleep until
     the next pointer event (so an idle page costs nothing) */
  draw(frame: Frame): boolean
  /* The viewport changed size */
  resize?(width: number, height: number): void
  /* A click or tap */
  press?(x: number, y: number, now: number): void
}

export type BackdropFactory = (theme: ThemeColors) => Backdrop

/* Reads the active theme's color tokens as "r g b", ready for `rgb(${c} / alpha)` */
export type ThemeColors = (token: string) => string

/* The pointer's easing: the smoothed position covers 1 - 1/e of the gap every POINTER_EASE seconds */
const POINTER_EASE = 0.06
/* Canvas resolution cap: the soft effects gain nothing from more pixels, and cost a lot */
const MAX_DPR = 1.5
/* Average draw time (ms) above which the rate halves, and below which it comes back */
const SLOW_FRAME = 9
const FAST_FRAME = 4

export function runBackdrop(canvas: HTMLCanvasElement, create: BackdropFactory): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const backdrop = create(themeColors())
  const pointer: Pointer = { x: -9999, y: -9999, sx: -9999, sy: -9999, movedAt: -Infinity }
  let width = 0
  let height = 0
  let frame = 0
  let last = 0
  let drawn = 0
  let cost = 0
  let halfRate = false

  const loop = (now: number) => {
    frame = 0
    // At half rate, skip every other display frame
    if (halfRate && now - drawn < 30) return wake()
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
    last = now
    drawn = now

    // Ease the smoothed pointer toward the real one, the same at any frame rate
    if (pointer.sx < -999) {
      pointer.sx = pointer.x
      pointer.sy = pointer.y
    } else {
      const k = 1 - Math.exp(-dt / POINTER_EASE)
      pointer.sx += (pointer.x - pointer.sx) * k
      pointer.sy += (pointer.y - pointer.sy) * k
    }

    const start = performance.now()
    ctx.clearRect(0, 0, width, height)
    const more = backdrop.draw({ ctx, width, height, now, dt, pointer })
    cost = cost * 0.95 + (performance.now() - start) * 0.05
    if (!halfRate && cost > SLOW_FRAME) halfRate = true
    else if (halfRate && cost < FAST_FRAME) halfRate = false

    if (more) wake()
    else last = 0
  }

  const wake = () => {
    if (!frame) frame = requestAnimationFrame(loop)
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    backdrop.resize?.(width, height)
    wake()
  }

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    // Coming back from outside the page: start the smoothed pointer here, not across the screen
    if (pointer.movedAt === -Infinity) pointer.sx = pointer.sy = -9999
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.movedAt = performance.now()
    wake()
  }

  const onDown = (event: PointerEvent) => {
    backdrop.press?.(event.clientX, event.clientY, performance.now())
    wake()
  }

  const onLeave = () => {
    pointer.movedAt = -Infinity
    wake()
  }

  // A hidden tab gets no frames; when it's back, start timing afresh
  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      last = 0
      wake()
    }
  }

  resize()
  window.addEventListener('resize', resize, { passive: true })
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  document.addEventListener('visibilitychange', onVisible)

  return () => {
    cancelAnimationFrame(frame)
    ctx.clearRect(0, 0, width, height)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    document.removeEventListener('visibilitychange', onVisible)
  }
}

/* Any CSS color the theme uses (hex, a var() alias...) normalized to "r g b" by letting a canvas parse it */
function themeColors(): ThemeColors {
  const styles = getComputedStyle(document.documentElement)
  const probe = document.createElement('canvas').getContext('2d')!
  return (token) => {
    probe.fillStyle = '#000'
    probe.fillStyle = styles.getPropertyValue(token).trim() || '#000'
    const hex = probe.fillStyle.startsWith('#') ? probe.fillStyle : '#000000'
    const value = Number.parseInt(hex.slice(1), 16)
    return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`
  }
}

/* How present the cursor's effect is: 1 while it moves, then a smooth fade to 0 */
export function presence(pointer: Pointer, now: number, hold = 700, fade = 800): number {
  const idle = now - pointer.movedAt
  return idle < hold ? 1 : smooth(Math.max(0, 1 - (idle - hold) / fade))
}

export function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

/* Frame-rate independent easing: the fraction of the remaining gap to close this frame, for a
   time constant tau in seconds */
export function ease(dt: number, tau: number): number {
  return 1 - Math.exp(-dt / tau)
}
