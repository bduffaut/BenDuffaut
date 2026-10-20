<!--
  The live lattice behind every page. It sits on the backdrop's 56px grid lines:
  - near the mouse, grid points come up as small + marks (the grid's edit-mode registration
    marks) that lean slightly toward the cursor, and the cell under it gets a faint highlight
    that glides from cell to cell, like the dashboard grid's drop placeholder
  - a click or tap sends a ripple through the lattice: no ring is drawn, the marks light up
    in cyan as the wave passes, and the clicked cell flashes
  It only draws while something is happening, so an idle page costs nothing, and it's off for
  reduced motion.
-->
<template>
  <canvas ref="canvas" class="field" />
</template>

<script setup lang="ts">
/* Spacing of the backdrop grid in main.css (.backdrop::before background-size) */
const CELL = 56
/* How far the cursor's influence reaches, and how far marks lean toward it */
const REACH = 220
const LEAN = 4
/* Marks stay lit this long after the mouse stops, then fade out over FADE */
const HOLD = 700
const FADE = 800
/* Ripple: speed in px/s, lifetime, and the width of the lit band */
const RIPPLE_SPEED = 620
const RIPPLE_LIFE = 1100
const RIPPLE_BAND = 40

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

onMounted(() => {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const tokens = getComputedStyle(document.documentElement)
  const accent = rgb(tokens.getPropertyValue('--color-accent'))
  const cyan = rgb(tokens.getPropertyValue('--color-cyan'))

  let width = 0
  let height = 0
  let frame = 0
  const pointer = { x: -9999, y: -9999, movedAt: -Infinity }
  const cell = { x: -9999, y: -9999 }
  const ripples: { x: number; y: number; at: number }[] = []

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    el.width = Math.round(width * dpr)
    el.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    wake()
  }

  const wake = () => {
    if (!frame) frame = requestAnimationFrame(draw)
  }

  const draw = (now: number) => {
    frame = 0
    ctx.clearRect(0, 0, width, height)

    // How present the cursor effect is: full while moving, then a slow fade
    const idle = now - pointer.movedAt
    const presence = idle < HOLD ? 1 : Math.max(0, 1 - (idle - HOLD) / FADE)

    while (ripples.length && now - ripples[0]!.at > RIPPLE_LIFE) ripples.shift()
    if (presence === 0 && !ripples.length) return // nothing to show: stop until the next event

    // The cell under the cursor, gliding toward its target
    if (presence > 0) {
      const tx = Math.floor(pointer.x / CELL) * CELL
      const ty = Math.floor(pointer.y / CELL) * CELL
      if (cell.x < -999) Object.assign(cell, { x: tx, y: ty })
      cell.x += (tx - cell.x) * 0.22
      cell.y += (ty - cell.y) * 0.22
      ctx.fillStyle = `rgb(${accent} / ${0.035 * presence})`
      ctx.fillRect(cell.x + 1, cell.y + 1, CELL - 1, CELL - 1)
      ctx.strokeStyle = `rgb(${accent} / ${0.14 * presence})`
      ctx.lineWidth = 1
      ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, CELL, CELL)
    }

    // Ripple flashes on the clicked cell
    for (const ripple of ripples) {
      const age = (now - ripple.at) / 450
      if (age >= 1) continue
      ctx.strokeStyle = `rgb(${cyan} / ${0.45 * (1 - age)})`
      ctx.strokeRect(Math.floor(ripple.x / CELL) * CELL + 0.5, Math.floor(ripple.y / CELL) * CELL + 0.5, CELL, CELL)
    }

    // The lattice: a + at each grid point the cursor or a ripple reaches
    ctx.lineWidth = 1
    for (let y = 0; y <= height + CELL; y += CELL) {
      for (let x = 0; x <= width + CELL; x += CELL) {
        let near = 0
        let dx = 0
        let dy = 0
        if (presence > 0) {
          dx = pointer.x - x
          dy = pointer.y - y
          const d = Math.hypot(dx, dy)
          if (d < REACH) near = presence * smooth(1 - d / REACH)
        }

        let wave = 0
        for (const ripple of ripples) {
          const age = now - ripple.at
          const radius = (age / 1000) * RIPPLE_SPEED
          const off = Math.abs(Math.hypot(x - ripple.x, y - ripple.y) - radius)
          if (off < RIPPLE_BAND) wave = Math.max(wave, (1 - off / RIPPLE_BAND) * (1 - age / RIPPLE_LIFE))
        }

        const level = Math.max(near, wave)
        if (level < 0.02) continue

        // Lean toward the cursor, strongest at middle distance so the mark under it stays put
        const d = Math.hypot(dx, dy) || 1
        const lean = near * LEAN * Math.min(1, d / 60)
        const px = x + (dx / d) * lean
        const py = y + (dy / d) * lean
        const arm = 1.5 + 3 * level

        ctx.strokeStyle = wave > near ? `rgb(${cyan} / ${0.9 * wave})` : `rgb(${accent} / ${0.5 * near})`
        ctx.beginPath()
        ctx.moveTo(px - arm, py)
        ctx.lineTo(px + arm, py)
        ctx.moveTo(px, py - arm)
        ctx.lineTo(px, py + arm)
        ctx.stroke()
      }
    }

    wake()
  }

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    pointer.x = event.clientX
    pointer.y = event.clientY
    pointer.movedAt = performance.now()
    wake()
  }

  const onDown = (event: PointerEvent) => {
    ripples.push({ x: event.clientX, y: event.clientY, at: performance.now() })
    if (ripples.length > 4) ripples.shift()
    wake()
  }

  const onLeave = () => {
    pointer.movedAt = -Infinity
    cell.x = cell.y = -9999
  }

  resize()
  window.addEventListener('resize', resize, { passive: true })
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    document.documentElement.removeEventListener('pointerleave', onLeave)
  })
})

/* "#2dd4bf" → "45 212 191", for rgb(r g b / a) strings */
function rgb(hex: string): string {
  const value = Number.parseInt(hex.trim().replace('#', ''), 16)
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}
</script>

<style scoped>
.field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
