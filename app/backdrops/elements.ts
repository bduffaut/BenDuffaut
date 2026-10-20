import { presence, smooth, type BackdropFactory } from './runner'

// Elements: the four elements, drawn in ink on the parchment.
// - air is always moving: wind lines drift across the page, each ending in a curl, and leaves
//   tumble along with them
// - hovering calls up four orbs, one per element (water, earth, fire, air), which circle the
//   cursor trailing ribbons of their color. Each is a mass on a spring chasing its place on the
//   circle, so they glide, swing wide behind a moving cursor and settle when it rests
// - each click or tap bends the next element in turn: a splash of water, a spray of rock, a
//   plume of fire, a gust of air spiralling outward
// Never started with reduced motion.

const ELEMENTS = ['water', 'earth', 'fire', 'air'] as const
type Element = (typeof ELEMENTS)[number]

/* The circle the orbs keep around the cursor, and how fast they go round it (radians/s) */
const ORB_RADIUS = 54
const ORB_SPIN = 1.15
/* Orb springs: stiffness, and damping as a fraction of critical (below 1 swings a little) */
const ORB_STIFFNESS = 70
const ORB_DAMPING = 0.72
/* How much time each trail covers, in seconds: the same length at any frame rate */
const TRAIL_SECONDS = 0.32

interface Gust {
  x: number
  y: number
  speed: number
  length: number
  wave: number
  age: number
  life: number
  curl: number
}

interface Leaf {
  x: number
  y: number
  vx: number
  turn: number
  spin: number
  size: number
}

interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  trail: { x: number; y: number; at: number }[]
}

interface Bit {
  kind: Element
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  size: number
  turn: number
}

export const elements: BackdropFactory = (theme) => {
  const color: Record<Element, string> = {
    water: theme('--el-water'),
    earth: theme('--el-earth'),
    fire: theme('--el-fire'),
    air: theme('--el-air'),
  }
  const halo = Object.fromEntries(ELEMENTS.map((kind) => [kind, haloSprite(color[kind])])) as Record<Element, HTMLCanvasElement>
  const damping = 2 * Math.sqrt(ORB_STIFFNESS) * ORB_DAMPING

  let width = 0
  let height = 0
  let gusts: Gust[] = []
  let leaves: Leaf[] = []
  let bits: Bit[] = []
  let spirals: { x: number; y: number; age: number }[] = []
  let ripples: { x: number; y: number; age: number }[] = []
  let next = 0
  let spin = 0
  let shown = 0
  const orbs: Orb[] = ELEMENTS.map(() => ({ x: Number.NaN, y: Number.NaN, vx: 0, vy: 0, trail: [] }))

  const newGust = (gust: Partial<Gust>, anywhere: boolean): Gust =>
    Object.assign(gust, {
      x: anywhere ? Math.random() * width : -350,
      y: height * (0.08 + Math.random() * 0.84),
      speed: 26 + Math.random() * 30,
      length: 160 + Math.random() * 200,
      wave: 6 + Math.random() * 10,
      age: anywhere ? Math.random() * 6 : 0,
      life: 9 + Math.random() * 7,
      curl: 7 + Math.random() * 8,
    })

  const newLeaf = (leaf: Partial<Leaf>, anywhere: boolean): Leaf =>
    Object.assign(leaf, {
      x: anywhere ? Math.random() * width : -20,
      y: height * Math.random(),
      vx: 18 + Math.random() * 26,
      turn: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 2.4,
      size: 4 + Math.random() * 4,
    })

  /* A wind line: a gentle wave that ends in a curl, the way wind is drawn in ink */
  const drawGust = (ctx: CanvasRenderingContext2D, gust: Gust, t: number) => {
    const fade = smooth(Math.max(0, Math.min(1, gust.age / 1.5, (gust.life - gust.age) / 1.5)))
    if (fade <= 0) return
    ctx.strokeStyle = `rgb(${color.air} / ${0.34 * fade})`
    ctx.lineWidth = 1.4
    ctx.beginPath()
    const steps = 24
    let hx = 0
    let hy = 0
    for (let i = 0; i <= steps; i++) {
      const p = i / steps
      hx = gust.x + p * gust.length
      hy = gust.y + Math.sin(p * 5 + t * 0.9 + gust.y) * gust.wave * p
      if (i === 0) ctx.moveTo(hx, hy)
      else ctx.lineTo(hx, hy)
    }
    // The curl: a spiral that winds in from the head of the line
    for (let a = 0; a <= Math.PI * 2.6; a += 0.2) {
      const r = gust.curl * (1 - a / (Math.PI * 3))
      ctx.lineTo(hx + Math.sin(a) * r, hy - gust.curl + Math.cos(a) * r)
    }
    ctx.stroke()
  }

  /* A ribbon behind an orb: one smooth curve through its recent positions, thin and faint at the
     tail, full at the orb */
  const drawTrail = (ctx: CanvasRenderingContext2D, kind: Element, trail: Orb['trail'], alpha: number) => {
    if (trail.length < 3) return
    // Butt caps: round ones overlap where segments meet and bead the ribbon with darker dots
    ctx.lineCap = 'butt'
    for (let j = 1; j < trail.length - 1; j++) {
      const a = trail[j - 1]!
      const b = trail[j]!
      const c = trail[j + 1]!
      const p = j / (trail.length - 1)
      ctx.strokeStyle = `rgb(${color[kind]} / ${p * p * 0.5 * alpha})`
      ctx.lineWidth = 0.6 + p * 2.6
      ctx.beginPath()
      ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2)
      ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2)
      ctx.stroke()
    }
    ctx.lineCap = 'round'
  }

  const drawOrb = (ctx: CanvasRenderingContext2D, kind: Element, x: number, y: number, t: number, alpha: number) => {
    const glow = halo[kind]
    ctx.globalAlpha = alpha * 0.55
    ctx.drawImage(glow, x - glow.width / 2, y - glow.height / 2)
    ctx.globalAlpha = 1

    const c = color[kind]
    ctx.fillStyle = `rgb(${c} / ${alpha})`
    ctx.strokeStyle = `rgb(${c} / ${alpha})`
    ctx.lineWidth = 1.6
    ctx.beginPath()
    if (kind === 'water') {
      // A drop
      ctx.moveTo(x, y - 8)
      ctx.quadraticCurveTo(x + 6, y, x, y + 5)
      ctx.quadraticCurveTo(x - 6, y, x, y - 8)
      ctx.fill()
    } else if (kind === 'earth') {
      // A tumbling stone
      const a = t * 0.8
      for (let i = 0; i < 5; i++) {
        const angle = a + (i / 5) * Math.PI * 2
        const r = i % 2 ? 5 : 6.5
        if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r)
        else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r)
      }
      ctx.closePath()
      ctx.fill()
    } else if (kind === 'fire') {
      // A flame, its tip licking
      const lick = Math.sin(t * 9) * 1.2 + Math.sin(t * 14) * 0.6
      ctx.moveTo(x, y - 9 - lick)
      ctx.quadraticCurveTo(x + 7, y - 1, x + 3, y + 5)
      ctx.quadraticCurveTo(x, y + 7, x - 3, y + 5)
      ctx.quadraticCurveTo(x - 7, y - 1, x, y - 9 - lick)
      ctx.fill()
    } else {
      // A small turning spiral
      for (let a = 0; a <= Math.PI * 3; a += 0.25) {
        const r = 1 + a * 1.1
        const px = x + Math.cos(a + t * 2.4) * r
        const py = y + Math.sin(a + t * 2.4) * r
        if (a === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    }
  }

  return {
    resize(w, h) {
      width = w
      height = h
      gusts = Array.from({ length: Math.round(Math.min(10, Math.max(5, (w * h) / 160000))) }, () => newGust({}, true))
      leaves = Array.from({ length: Math.round(Math.min(18, Math.max(8, w / 90))) }, () => newLeaf({}, true))
    },

    press(x, y) {
      const kind = ELEMENTS[next]!
      next = (next + 1) % ELEMENTS.length
      if (kind === 'air') {
        spirals.push({ x, y, age: 0 })
        return
      }
      if (kind === 'water') ripples.push({ x, y, age: 0 })
      const count = kind === 'fire' ? 30 : kind === 'water' ? 22 : 12
      for (let i = 0; i < count; i++) {
        const angle = kind === 'fire' ? -Math.PI / 2 + (Math.random() - 0.5) * 1.4 : -Math.PI / 2 + (Math.random() - 0.5) * 2.6
        const speed = kind === 'fire' ? 60 + Math.random() * 140 : 150 + Math.random() * 230
        bits.push({
          kind,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          age: 0,
          life: kind === 'fire' ? 0.7 + Math.random() * 0.6 : 0.9 + Math.random() * 0.6,
          size: kind === 'earth' ? 3 + Math.random() * 4 : 1.5 + Math.random() * 2.5,
          turn: Math.random() * Math.PI,
        })
      }
      if (bits.length > 200) bits.splice(0, bits.length - 200)
    },

    draw({ ctx, now, dt, pointer }) {
      const t = now / 1000
      const near = presence(pointer, now, 1800, 1200)

      // Air: wind lines and the leaves they carry
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (const gust of gusts) {
        gust.age += dt
        gust.x += gust.speed * dt
        if (gust.age > gust.life || gust.x > width + 40) newGust(gust, false)
        drawGust(ctx, gust, t)
      }
      for (const leaf of leaves) {
        leaf.x += (leaf.vx + Math.sin(t + leaf.turn) * 10) * dt
        leaf.y += Math.sin(t * 0.8 + leaf.turn * 2) * 14 * dt
        leaf.turn += leaf.spin * dt
        if (leaf.x > width + 20) newLeaf(leaf, false)
        ctx.fillStyle = `rgb(${color.earth} / 0.32)`
        ctx.beginPath()
        ctx.ellipse(leaf.x, leaf.y, leaf.size, leaf.size * 0.42 * Math.abs(Math.cos(leaf.turn)) + 0.6, leaf.turn, 0, Math.PI * 2)
        ctx.fill()
      }

      // The four orbs. `shown` eases in and out, so they fade rather than pop
      shown += ((near > 0 ? 1 : 0) - shown) * (1 - Math.exp(-dt / 0.25))
      spin += ORB_SPIN * dt
      if (shown < 0.01 && near === 0) {
        for (const orb of orbs) {
          orb.x = orb.y = Number.NaN
          orb.trail = []
        }
      } else {
        ELEMENTS.forEach((kind, i) => {
          const orb = orbs[i]!
          const angle = spin + (i / ELEMENTS.length) * Math.PI * 2
          // The circle breathes a little, so the orbs never feel mechanical
          const radius = ORB_RADIUS * (0.8 + 0.2 * shown) * (1 + 0.08 * Math.sin(t * 1.3 + i))
          const tx = pointer.sx + Math.cos(angle) * radius
          const ty = pointer.sy + Math.sin(angle) * radius * 0.82
          if (Number.isNaN(orb.x)) {
            orb.x = tx
            orb.y = ty
            orb.vx = orb.vy = 0
          }
          // Spring toward its place on the circle
          orb.vx += ((tx - orb.x) * ORB_STIFFNESS - orb.vx * damping) * dt
          orb.vy += ((ty - orb.y) * ORB_STIFFNESS - orb.vy * damping) * dt
          orb.x += orb.vx * dt
          orb.y += orb.vy * dt

          orb.trail.push({ x: orb.x, y: orb.y, at: now })
          while (orb.trail.length && now - orb.trail[0]!.at > TRAIL_SECONDS * 1000) orb.trail.shift()

          drawTrail(ctx, kind, orb.trail, shown)
          drawOrb(ctx, kind, orb.x, orb.y, t, 0.9 * shown)
        })
      }

      // Bending: the bursts from clicks
      ripples = ripples.filter((ripple) => (ripple.age += dt) < 1)
      for (const ripple of ripples) {
        const grow = 1 - Math.pow(1 - ripple.age, 3)
        ctx.strokeStyle = `rgb(${color.water} / ${0.5 * (1 - ripple.age)})`
        ctx.lineWidth = 1.5
        for (const scale of [1, 0.6]) {
          ctx.beginPath()
          ctx.ellipse(ripple.x, ripple.y, grow * 120 * scale, grow * 40 * scale, 0, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      spirals = spirals.filter((spiral) => (spiral.age += dt) < 1.2)
      for (const spiral of spirals) {
        const left = 1 - spiral.age / 1.2
        const grow = 1 - Math.pow(left, 3)
        ctx.strokeStyle = `rgb(${color.air} / ${0.6 * left})`
        ctx.lineWidth = 1.8
        for (let arm = 0; arm < 3; arm++) {
          ctx.beginPath()
          for (let a = 0; a <= Math.PI * 2.4; a += 0.12) {
            const r = a * 12 * (0.4 + grow)
            const angle = a + arm * ((Math.PI * 2) / 3) + grow * 4
            const px = spiral.x + Math.cos(angle) * r
            const py = spiral.y + Math.sin(angle) * r
            if (a === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.stroke()
        }
      }

      bits = bits.filter((bit) => (bit.age += dt) < bit.life)
      for (const bit of bits) {
        const left = 1 - bit.age / bit.life
        if (bit.kind === 'fire') {
          // Flames rise, waver and shrink
          bit.vy -= 60 * dt
          bit.vx += Math.sin(t * 9 + bit.turn * 5) * 120 * dt
        } else {
          bit.vy += 640 * dt
        }
        bit.x += bit.vx * dt
        bit.y += bit.vy * dt
        bit.turn += dt * 4
        ctx.fillStyle = `rgb(${color[bit.kind]} / ${0.8 * left})`
        if (bit.kind === 'earth') {
          ctx.save()
          ctx.translate(bit.x, bit.y)
          ctx.rotate(bit.turn)
          ctx.fillRect(-bit.size / 2, -bit.size / 2, bit.size, bit.size * 0.8)
          ctx.restore()
        } else {
          ctx.beginPath()
          ctx.arc(bit.x, bit.y, bit.kind === 'fire' ? bit.size * (0.6 + left) : bit.size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      return true
    },
  }
}

/* A soft disc of color, drawn once per element and stamped under each orb */
function haloSprite(color: string): HTMLCanvasElement {
  const size = 44
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgb(${color} / 0.35)`)
  gradient.addColorStop(1, `rgb(${color} / 0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}
