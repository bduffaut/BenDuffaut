import { ease, presence, smooth, type BackdropFactory } from './runner'

// Grove: dusk in a meadow at the edge of the trees.
// - fireflies drift and blink on their own. Hovering draws them in: they swirl around the
//   cursor and light up, around a soft lantern glow, so the effect shows without clicking.
//   A click or tap startles them outward
// - grass grows along the bottom of the screen in two layers. Every blade is a damped spring,
//   so it overshoots and settles instead of snapping. A slow wind rolls across it; the cursor
//   parts it, brushes it along as it moves, and sends waves rolling out through the meadow
// The runner never starts it with reduced motion.

const FIREFLY_REACH = 360
const FIREFLY_SPEED = 11
const GATHER_SPEED = 70
/* How far around the cursor the grass parts, and how strongly */
const PART_REACH = 150
const PART_STRENGTH = 0.8
/* Spring stiffness and damping per blade: underdamped, so blades sway past and settle */
const STIFFNESS = 38
const DAMPING = 5
/* Waves the cursor sends through the grass: speed in px/s, how long they last, band width */
const WAVE_SPEED = 420
const WAVE_LIFE = 1400
const WAVE_BAND = 60
const WAVE_EVERY = 90

interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  seed: number
  blink: number
  /* Each one circles the cursor at its own distance */
  orbit: number
}

interface Blade {
  x: number
  height: number
  width: number
  lean: number
  alpha: number
  angle: number
  spin: number
}

interface Wave {
  x: number
  at: number
  strength: number
}

export const grove: BackdropFactory = (theme) => {
  const glow = theme('--color-data')
  const leaf = theme('--color-accent')
  const shade = theme('--color-surface-3')
  const sprite = fireflySprite(glow, theme('--color-data-strong'))

  let flies: Firefly[] = []
  let back: Blade[] = []
  let front: Blade[] = []
  let waves: Wave[] = []
  let tallest = 0
  let lastWave = 0
  let prevX = Number.NaN

  const grow = (width: number, step: number, tall: number, alpha: number): Blade[] => {
    const blades: Blade[] = []
    for (let x = -8; x < width + 8; x += step * (0.6 + Math.random() * 0.8)) {
      // Taller toward the edges, so the middle of the page stays clear
      const edge = 1 - Math.sin(Math.PI * Math.min(1, Math.max(0, x / width)))
      const lean = (Math.random() - 0.5) * 0.35
      blades.push({
        x,
        height: tall * (0.35 + Math.random() * 0.65) * (0.55 + edge * 0.8),
        width: 1.6 + Math.random() * 2.6,
        lean,
        alpha: alpha * (0.6 + Math.random() * 0.4),
        angle: lean,
        spin: 0,
      })
    }
    return blades
  }

  return {
    resize(width, height) {
      const count = Math.round(Math.min(64, Math.max(24, (width * height) / 22000)))
      flies = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: height * (0.1 + Math.random() * 0.85),
        vx: 0,
        vy: 0,
        seed: Math.random() * 100,
        blink: 0.5 + Math.random() * 0.9,
        orbit: 30 + Math.random() * 110,
      }))
      tallest = Math.min(130, Math.max(64, height * 0.13))
      back = grow(width, 4, tallest * 0.75, 0.32)
      front = grow(width, 6, tallest, 0.2)
    },

    press(x, y, now) {
      for (const fly of flies) {
        const dx = fly.x - x
        const dy = fly.y - y
        const d = Math.hypot(dx, dy) || 1
        if (d > 260) continue
        const kick = 170 * (1 - d / 260)
        fly.vx += (dx / d) * kick
        fly.vy += (dy / d) * kick
      }
      waves.push({ x, at: now, strength: 1.4 })
    },

    draw({ ctx, width, height, now, dt, pointer }) {
      const t = now / 1000
      const near = presence(pointer, now, 1500, 2500)

      // How fast the cursor is moving sideways, for brushing the grass along. Unknown on the
      // first frame it's back, so arriving from elsewhere doesn't read as one huge sweep
      const moveX = near > 0 && dt > 0 && Number.isFinite(prevX) ? Math.max(-2500, Math.min(2500, (pointer.sx - prevX) / dt)) : 0
      prevX = near > 0 ? pointer.sx : Number.NaN

      // A cursor moving low over the meadow keeps sending waves through it
      const low = near > 0 && pointer.sy > height - tallest - PART_REACH
      if (low && Math.abs(moveX) > 40 && now - lastWave > WAVE_EVERY) {
        waves.push({ x: pointer.sx, at: now, strength: Math.min(1, Math.abs(moveX) / 900) })
        lastWave = now
      }
      waves = waves.filter((wave) => now - wave.at < WAVE_LIFE)

      const settle = (blade: Blade, reach: number) => {
        // Where the blade wants to be: its own lean, the wind, and parted around the cursor
        let target = blade.lean + Math.sin(t * 0.55 - blade.x * 0.006) * 0.1 + Math.sin(t * 1.3 + blade.x * 0.05) * 0.035
        if (low) {
          const dx = blade.x - pointer.sx
          if (Math.abs(dx) < PART_REACH) {
            const close = near * smooth(1 - Math.abs(dx) / PART_REACH) * reach
            target += Math.sign(dx) * close * PART_STRENGTH
            // Brushed along in the direction the cursor moves
            blade.spin += moveX * 0.05 * close * dt
          }
        }
        // Waves kick the blades they pass, away from where they started
        for (const wave of waves) {
          const age = now - wave.at
          const off = Math.abs(Math.abs(blade.x - wave.x) - (age / 1000) * WAVE_SPEED)
          if (off >= WAVE_BAND) continue
          const kick = wave.strength * (1 - off / WAVE_BAND) * (1 - age / WAVE_LIFE) * reach
          blade.spin += Math.sign(blade.x - wave.x || 1) * kick * 9 * dt
        }
        blade.spin += ((target - blade.angle) * STIFFNESS - blade.spin * DAMPING) * dt
        blade.angle += blade.spin * dt
      }

      const drawBlades = (blades: Blade[], color: string, reach: number) => {
        for (const blade of blades) {
          settle(blade, reach)
          const tipX = blade.x + Math.sin(blade.angle) * blade.height
          const tipY = height - Math.cos(blade.angle) * blade.height
          const bendX = blade.x + Math.sin(blade.angle * 0.5) * blade.height * 0.5
          const bendY = height - blade.height * 0.55
          ctx.fillStyle = `rgb(${color} / ${blade.alpha})`
          ctx.beginPath()
          ctx.moveTo(blade.x - blade.width / 2, height + 2)
          ctx.quadraticCurveTo(bendX - blade.width * 0.3, bendY, tipX, tipY)
          ctx.quadraticCurveTo(bendX + blade.width * 0.3, bendY, blade.x + blade.width / 2, height + 2)
          ctx.fill()
        }
      }

      // The lantern: a soft warm light under the cursor that the fireflies gather to
      if (near > 0) {
        const lantern = ctx.createRadialGradient(pointer.sx, pointer.sy, 0, pointer.sx, pointer.sy, 180)
        lantern.addColorStop(0, `rgb(${glow} / ${0.07 * near})`)
        lantern.addColorStop(1, `rgb(${glow} / 0)`)
        ctx.fillStyle = lantern
        ctx.fillRect(pointer.sx - 180, pointer.sy - 180, 360, 360)
      }

      // Grass: the back layer in shadow, the front catching a little green light
      drawBlades(back, shade, 0.6)
      drawBlades(front, leaf, 1)

      // Fireflies
      for (const fly of flies) {
        const wander = Math.sin(t * 0.31 + fly.seed) * 1.7 + Math.sin(t * 0.17 + fly.seed * 2.3) * 1.3
        let wantX = Math.cos(wander) * FIREFLY_SPEED
        let wantY = Math.sin(wander) * FIREFLY_SPEED * 0.7

        let pull = 0
        if (near > 0) {
          const d = Math.hypot(pointer.sx - fly.x, pointer.sy - fly.y)
          if (d < FIREFLY_REACH) {
            pull = near * smooth(1 - d / FIREFLY_REACH)
            // Swirl: aim for a point that circles the cursor, so they orbit rather than pile up
            const spin = t * 0.8 + fly.seed
            const ox = pointer.sx + Math.cos(spin) * fly.orbit - fly.x
            const oy = pointer.sy + Math.sin(spin) * fly.orbit * 0.75 - fly.y
            const od = Math.hypot(ox, oy) || 1
            wantX += (ox / od) * GATHER_SPEED * pull
            wantY += (oy / od) * GATHER_SPEED * pull
          }
        }

        // Ease toward the wanted velocity, which also lets a startle die away
        fly.vx += (wantX - fly.vx) * ease(dt, 0.7)
        fly.vy += (wantY - fly.vy) * ease(dt, 0.7)
        fly.x += fly.vx * dt
        fly.y += fly.vy * dt
        if (fly.x < -30) fly.x = width + 30
        if (fly.x > width + 30) fly.x = -30
        if (fly.y < -30) fly.y = height + 30
        if (fly.y > height + 30) fly.y = -30

        // Slow blinks, never fully dark, and glowing steadily once gathered at the cursor
        const lit = Math.pow(Math.max(0, Math.sin(t * fly.blink + fly.seed)), 3)
        const size = sprite.width * (0.5 + 0.25 * pull)
        ctx.globalAlpha = Math.min(1, 0.22 + 0.7 * lit + 0.75 * pull)
        ctx.drawImage(sprite, fly.x - size / 2, fly.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
      return true
    },
  }
}

/* A soft glow with a bright core, drawn once and stamped for every firefly */
function fireflySprite(color: string, core: string): HTMLCanvasElement {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgb(${core} / 1)`)
  gradient.addColorStop(0.08, `rgb(${color} / 1)`)
  gradient.addColorStop(0.3, `rgb(${color} / 0.28)`)
  gradient.addColorStop(1, `rgb(${color} / 0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}
