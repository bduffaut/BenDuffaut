import { presence, smooth, type BackdropFactory } from './runner'

// Mustafar: the air over a lava world, shot like film.
// - embers rise on the heat in three depths: faint specks far off, sharp sparks in the middle
//   distance trailing short streaks, and a few large, soft, out-of-focus ones drifting past
//   close to the lens. Ash drifts down through them in the same three depths
// - the lava itself is beyond the horizon (themes/mustafar.css): here its light breathes,
//   slowly and unevenly, up from the bottom of the frame
// - hovering makes the cursor a heat source: a faint warmth follows it, embers nearby are drawn
//   into a rising spiral around it, and the ash lifts away on the updraft
// - a click or tap throws a burst of thin sparks that arc and fall
// Never started with reduced motion.

const VORTEX_REACH = 280
const UPDRAFT_REACH = 220

/* far, mid, near: how big, how bright, how fast, and how many of each */
const DEPTHS = [
  { size: 0.32, alpha: 0.55, speed: 0.55, share: 0.5 },
  { size: 0.55, alpha: 0.95, speed: 1, share: 0.42 },
  { size: 2.4, alpha: 0.22, speed: 1.6, share: 0.08 },
] as const

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  depth: number
  age: number
  life: number
  seed: number
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
}

export const mustafar: BackdropFactory = (theme) => {
  const molten = theme('--color-accent')
  const hot = theme('--color-data')
  const whiteHot = theme('--color-data-strong')
  const deep = theme('--color-accent-alt')
  const ashColor = theme('--color-muted')
  const sharp = emberSprite(whiteHot, molten, 0.12)
  const soft = emberSprite(hot, molten, 0.4)

  let width = 0
  let height = 0
  let embers: Mote[] = []
  let ash: Mote[] = []
  let sparks: Spark[] = []

  const pickDepth = () => {
    const r = Math.random()
    return r < DEPTHS[0].share ? 0 : r < DEPTHS[0].share + DEPTHS[1].share ? 1 : 2
  }

  const spawnEmber = (mote: Partial<Mote>, anywhere: boolean): Mote => {
    const depth = pickDepth()
    return Object.assign(mote, {
      depth,
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 20,
      vx: (Math.random() - 0.5) * 12,
      vy: -(24 + Math.random() * 40) * DEPTHS[depth].speed,
      age: anywhere ? Math.random() * 5 : 0,
      life: 5 + Math.random() * 6,
      seed: Math.random() * 100,
    })
  }

  const spawnAsh = (mote: Partial<Mote>, anywhere: boolean): Mote => {
    const depth = pickDepth()
    return Object.assign(mote, {
      depth,
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : -12,
      vx: (-2 + Math.random() * 8) * DEPTHS[depth].speed,
      vy: (8 + Math.random() * 14) * DEPTHS[depth].speed,
      age: 0,
      life: Infinity,
      seed: Math.random() * 100,
    })
  }

  return {
    resize(w, h) {
      width = w
      height = h
      const area = (w * h) / 10000
      embers = Array.from({ length: Math.round(Math.min(110, Math.max(40, area * 0.6))) }, () => spawnEmber({}, true))
      ash = Array.from({ length: Math.round(Math.min(80, Math.max(26, area * 0.4))) }, () => spawnAsh({}, true))
      sparks = []
    },

    press(x, y) {
      for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 160 + Math.random() * 340
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 140, age: 0, life: 0.55 + Math.random() * 0.6 })
      }
      if (sparks.length > 140) sparks.splice(0, sparks.length - 140)
    },

    draw({ ctx, now, dt, pointer }) {
      const t = now / 1000
      const near = presence(pointer, now, 1500, 2000)

      // The lava's light from beyond the horizon, breathing slowly and never quite evenly
      const breath = 0.75 + 0.25 * (Math.sin(t * 0.7) * 0.6 + Math.sin(t * 1.9 + 1.3) * 0.4)
      const glow = ctx.createLinearGradient(0, height, 0, height * 0.55)
      glow.addColorStop(0, `rgb(${molten} / ${0.12 * breath})`)
      glow.addColorStop(0.45, `rgb(${deep} / ${0.05 * breath})`)
      glow.addColorStop(1, `rgb(${deep} / 0)`)
      ctx.fillStyle = glow
      ctx.fillRect(0, height * 0.55, width, height * 0.45)

      // Warmth following the cursor
      if (near > 0) {
        const heat = ctx.createRadialGradient(pointer.sx, pointer.sy, 0, pointer.sx, pointer.sy, 240)
        heat.addColorStop(0, `rgb(${molten} / ${0.075 * near})`)
        heat.addColorStop(1, `rgb(${molten} / 0)`)
        ctx.fillStyle = heat
        ctx.fillRect(pointer.sx - 240, pointer.sy - 240, 480, 480)
      }

      // Ash, drifting down, lifted away from the cursor's heat
      for (const flake of ash) {
        const d = DEPTHS[flake.depth]!
        let vx = flake.vx + Math.sin(t * 0.5 + flake.seed) * 5 * d.speed
        let vy = flake.vy
        if (near > 0) {
          const dx = flake.x - pointer.sx
          const dy = flake.y - pointer.sy
          const dist = Math.hypot(dx, dy) || 1
          if (dist < UPDRAFT_REACH) {
            const lift = near * smooth(1 - dist / UPDRAFT_REACH) * 70
            vx += (dx / dist) * lift
            vy += (dy / dist) * lift - lift
          }
        }
        flake.x += vx * dt
        flake.y += vy * dt
        if (flake.y > height + 12 || flake.y < -40 || flake.x < -20 || flake.x > width + 20) spawnAsh(flake, false)
        const size = 0.8 + d.size * 1.6
        const turn = t * 0.9 + flake.seed
        ctx.fillStyle = `rgb(${ashColor} / ${d.alpha * 0.32})`
        ctx.beginPath()
        ctx.ellipse(flake.x, flake.y, size, size * (0.35 + 0.65 * Math.abs(Math.sin(turn))), turn, 0, Math.PI * 2)
        ctx.fill()
      }

      // Embers, rising, gathered into a spiral around the cursor
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'round'
      for (const ember of embers) {
        const d = DEPTHS[ember.depth]!
        ember.age += dt
        let vx = ember.vx + Math.sin(t * 1.6 + ember.seed) * 12 * d.speed
        let vy = ember.vy
        let drawn = 0
        if (near > 0 && ember.depth < 2) {
          const dx = ember.x - pointer.sx
          const dy = ember.y - pointer.sy
          const dist = Math.hypot(dx, dy) || 1
          if (dist < VORTEX_REACH) {
            drawn = near * smooth(1 - dist / VORTEX_REACH)
            // Around the cursor, a little inward, and up: a rising spiral
            vx += ((-dy / dist) * 120 - (dx / dist) * 30) * drawn
            vy += ((dx / dist) * 120 - (dy / dist) * 30 - 40) * drawn
          }
        }
        const x0 = ember.x
        const y0 = ember.y
        ember.x += vx * dt
        ember.y += vy * dt
        if (ember.age > ember.life || ember.y < -40) spawnEmber(ember, false)

        const fade = smooth(Math.min(1, ember.age / 1.2)) * smooth(Math.max(0, 1 - ember.age / ember.life))
        const flicker = 0.75 + 0.25 * Math.sin(t * 11 + ember.seed)
        const alpha = Math.min(1, fade * flicker * d.alpha * (1 + 0.6 * drawn))
        if (alpha <= 0.01) continue

        if (ember.depth === 2) {
          // Close to the lens: big, soft and out of focus
          const size = soft.width * d.size * 0.5
          ctx.globalAlpha = alpha
          ctx.drawImage(soft, ember.x - size / 2, ember.y - size / 2, size, size)
          continue
        }
        // A short streak along its path, as a camera's shutter would catch it
        const speed = Math.hypot(ember.x - x0, ember.y - y0)
        if (ember.depth === 1 && speed > 0.6) {
          ctx.globalAlpha = 1
          ctx.strokeStyle = `rgb(${hot} / ${alpha * 0.5})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(ember.x - (ember.x - x0) * 4, ember.y - (ember.y - y0) * 4)
          ctx.lineTo(ember.x, ember.y)
          ctx.stroke()
        }
        const size = sharp.width * d.size * 0.5
        ctx.globalAlpha = alpha
        ctx.drawImage(sharp, ember.x - size / 2, ember.y - size / 2, size, size)
      }

      // Sparks from clicks: thin streaks that arc and fall
      ctx.globalAlpha = 1
      sparks = sparks.filter((spark) => (spark.age += dt) < spark.life)
      for (const spark of sparks) {
        spark.vy += 720 * dt
        spark.vx *= 1 - 1.2 * dt
        const x0 = spark.x
        const y0 = spark.y
        spark.x += spark.vx * dt
        spark.y += spark.vy * dt
        const left = 1 - spark.age / spark.life
        ctx.strokeStyle = `rgb(${left > 0.55 ? whiteHot : hot} / ${left})`
        ctx.lineWidth = 0.8 + left * 0.8
        ctx.beginPath()
        ctx.moveTo(x0 - (spark.x - x0), y0 - (spark.y - y0))
        ctx.lineTo(spark.x, spark.y)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
      return true
    },
  }
}

/* An ember: a hot core fading out through orange. `core` is how much of it is solid heat:
   small for a sharp spark, large for one blurred out of focus */
function emberSprite(center: string, glow: string, core: number): HTMLCanvasElement {
  const size = 48
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgb(${center} / 1)`)
  gradient.addColorStop(core, `rgb(${center} / 0.85)`)
  gradient.addColorStop(Math.min(0.9, core + 0.25), `rgb(${glow} / 0.3)`)
  gradient.addColorStop(1, `rgb(${glow} / 0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}
