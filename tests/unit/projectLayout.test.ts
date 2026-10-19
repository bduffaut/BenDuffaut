import { describe, expect, it } from 'vitest'
import { defaultProjectLayout, projectCatalog, statId, unplaced } from '../../shared/utils/projectLayout'

const FEATURED = [
  { slug: 'dashboard-grid', metrics: 3 },
  { slug: 'tennistracker', metrics: 3 },
  { slug: 'news-briefing', metrics: 0 },
  { slug: 'mtlj', metrics: 0 },
  { slug: 'mode-surface', metrics: 0 },
]

describe('defaultProjectLayout', () => {
  const layout = defaultProjectLayout(FEATURED)

  it('has a widget per project plus the stat tiles', () => {
    expect(layout.map((w) => w.id)).toEqual([
      'dashboard-grid',
      'tennistracker',
      'news-briefing',
      'mtlj',
      'mode-surface',
      statId('tennistracker', 0),
      statId('dashboard-grid', 0),
    ])
  })

  it('fits in 12 columns with no overlaps', () => {
    const cells = new Set<string>()
    for (const w of layout) {
      expect(w.x + w.w).toBeLessThanOrEqual(12)
      for (let x = w.x; x < w.x + w.w; x++)
        for (let y = w.y; y < w.y + w.h; y++) {
          const key = `${x},${y}`
          expect(cells.has(key), `${w.id} overlaps at ${key}`).toBe(false)
          cells.add(key)
        }
    }
  })

  it('uses varied sizes, not one card size', () => {
    expect(new Set(layout.map((w) => `${w.w}x${w.h}`)).size).toBeGreaterThan(4)
  })
})

describe('projectCatalog', () => {
  it('skips stat tiles whose project or metric is missing', () => {
    const ids = projectCatalog([{ slug: 'tennistracker', metrics: 0 }]).map((e) => e.id)
    expect(ids).toEqual(['tennistracker'])
  })

  it('puts projects without a hand-placed spot below the board for the grid to place', () => {
    const [entry] = projectCatalog([{ slug: 'brand-new', metrics: 0 }])
    expect(entry!.widget).toMatchObject({ id: 'brand-new', w: 4, h: 5, y: 1000 })
  })
})

describe('unplaced', () => {
  it('drops the position so the grid can choose one', () => {
    const widget = unplaced(defaultProjectLayout(FEATURED)[0]!)
    expect(widget).not.toHaveProperty('x')
    expect(widget).not.toHaveProperty('y')
    expect(widget).toMatchObject({ id: 'dashboard-grid', w: 7, h: 7 })
  })
})
