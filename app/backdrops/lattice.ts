import { ease, presence, smooth, type BackdropFactory } from './runner'

// Signal: the live lattice on the backdrop's 56px grid lines.
// - near the mouse, grid points come up as small + marks (the grid's edit-mode registration
//   marks) that lean slightly toward the cursor, and the cell under it gets a faint highlight
//   that glides from cell to cell, like the dashboard grid's drop placeholder
// - a click or tap sends a ripple through the lattice: no ring is drawn, the marks light up
//   in the data color as the wave passes, and the clicked cell flashes

/* Spacing of the backdrop grid in main.css (.backdrop::before background-size) */
const CELL = 56
/* How far the cursor's influence reaches, and how far marks lean toward it */
const REACH = 220
const LEAN = 4
/* Ripple: speed in px/s, lifetime, and the width of the lit band */
const RIPPLE_SPEED = 620
const RIPPLE_LIFE = 1100
const RIPPLE_BAND = 40

export const lattice: BackdropFactory = (theme) => {
  const accent = theme('--color-accent')
  const data = theme('--color-data')
  const cell = { x: -9999, y: -9999 }
  const ripples: { x: number; y: number; at: number }[] = []

  return {
    press(x, y, now) {
      ripples.push({ x, y, at: now })
      if (ripples.length > 4) ripples.shift()
    },

    draw({ ctx, width, height, now, dt, pointer }) {
      const near = presence(pointer, now)
      while (ripples.length && now - ripples[0]!.at > RIPPLE_LIFE) ripples.shift()
      if (near === 0) cell.x = cell.y = -9999
      if (near === 0 && !ripples.length) return false

      // The cell under the cursor, gliding toward its target
      if (near > 0) {
        const tx = Math.floor(pointer.sx / CELL) * CELL
        const ty = Math.floor(pointer.sy / CELL) * CELL
        if (cell.x < -999) Object.assign(cell, { x: tx, y: ty })
        cell.x += (tx - cell.x) * ease(dt, 0.07)
        cell.y += (ty - cell.y) * ease(dt, 0.07)
        ctx.fillStyle = `rgb(${accent} / ${0.035 * near})`
        ctx.fillRect(cell.x + 1, cell.y + 1, CELL - 1, CELL - 1)
        ctx.strokeStyle = `rgb(${accent} / ${0.14 * near})`
        ctx.lineWidth = 1
        ctx.strokeRect(cell.x + 0.5, cell.y + 0.5, CELL, CELL)
      }

      // Ripple flashes on the clicked cell
      for (const ripple of ripples) {
        const age = (now - ripple.at) / 450
        if (age >= 1) continue
        ctx.strokeStyle = `rgb(${data} / ${0.45 * (1 - age)})`
        ctx.strokeRect(Math.floor(ripple.x / CELL) * CELL + 0.5, Math.floor(ripple.y / CELL) * CELL + 0.5, CELL, CELL)
      }

      // The lattice: a + at each grid point the cursor or a ripple reaches
      ctx.lineWidth = 1
      for (let y = 0; y <= height + CELL; y += CELL) {
        for (let x = 0; x <= width + CELL; x += CELL) {
          let close = 0
          let dx = 0
          let dy = 0
          if (near > 0) {
            dx = pointer.sx - x
            dy = pointer.sy - y
            const d = Math.hypot(dx, dy)
            if (d < REACH) close = near * smooth(1 - d / REACH)
          }

          let wave = 0
          for (const ripple of ripples) {
            const age = now - ripple.at
            const radius = (age / 1000) * RIPPLE_SPEED
            const off = Math.abs(Math.hypot(x - ripple.x, y - ripple.y) - radius)
            if (off < RIPPLE_BAND) wave = Math.max(wave, (1 - off / RIPPLE_BAND) * (1 - age / RIPPLE_LIFE))
          }

          const level = Math.max(close, wave)
          if (level < 0.02) continue

          // Lean toward the cursor, strongest at middle distance so the mark under it stays put
          const d = Math.hypot(dx, dy) || 1
          const lean = close * LEAN * Math.min(1, d / 60)
          const px = x + (dx / d) * lean
          const py = y + (dy / d) * lean
          const arm = 1.5 + 3 * level

          ctx.strokeStyle = wave > close ? `rgb(${data} / ${0.9 * wave})` : `rgb(${accent} / ${0.5 * close})`
          ctx.beginPath()
          ctx.moveTo(px - arm, py)
          ctx.lineTo(px + arm, py)
          ctx.moveTo(px, py - arm)
          ctx.lineTo(px, py + arm)
          ctx.stroke()
        }
      }
      return true
    },
  }
}
