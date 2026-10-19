import type { GridWidget } from 'custom-dashboard-grid'

// The home page's project board, which runs on custom-dashboard-grid.
//
// Two widget types:
//   project  one project, showing more (visual, metrics, stack) as it gets bigger
//   stat     one headline number from a project's `metrics`, as a small KPI tile
//
// The default arrangement is designed by hand on 12 columns with 52px rows. Featured projects
// that aren't in it yet (added later in content/) are placed in the first free spot.

export const PROJECT_LAYOUT_VERSION = 2

export interface BoardProject {
  slug: string
  metrics: number
}

export interface CatalogEntry {
  id: string
  kind: 'project' | 'stat'
  slug: string
  widget: GridWidget
}

const PROJECT_SIZE = { w: 4, h: 5, minW: 3, minH: 3 }
const STAT_SIZE = { minW: 2, minH: 2, maxH: 4 }

/* Hand-placed default board: x, y, w, h per widget id */
const DEFAULT_PLACEMENT: Record<string, [x: number, y: number, w: number, h: number]> = {
  'dashboard-grid': [0, 0, 7, 7],
  tennistracker: [7, 0, 5, 5],
  'stat-tennistracker-0': [7, 5, 5, 2],
  'news-briefing': [0, 7, 5, 5],
  mtlj: [5, 7, 3, 5],
  // Starts small on purpose: resizing it shows how widgets open up as they grow
  'mode-surface': [8, 7, 4, 3],
  'stat-dashboard-grid-0': [8, 10, 4, 2],
}

/* Which project metrics get their own stat tile: [project slug, index into its metrics] */
const STAT_TILES: [slug: string, metric: number][] = [
  ['tennistracker', 0],
  ['dashboard-grid', 0],
]

export const statId = (slug: string, metric: number) => `stat-${slug}-${metric}`

/* Every widget the board can show, in reading order. Removed widgets come back from here. */
export function projectCatalog(projects: BoardProject[]): CatalogEntry[] {
  const entries: CatalogEntry[] = []

  for (const { slug } of projects) {
    entries.push({ id: slug, kind: 'project', slug, widget: place({ id: slug, type: 'project', props: { slug }, ...PROJECT_SIZE }) })
  }

  for (const [slug, metric] of STAT_TILES) {
    const project = projects.find((p) => p.slug === slug)
    if (!project || metric >= project.metrics) continue
    const id = statId(slug, metric)
    entries.push({ id, kind: 'stat', slug, widget: place({ id, type: 'stat', props: { slug, metric }, w: 3, h: 2, ...STAT_SIZE }) })
  }

  return entries
}

export function defaultProjectLayout(projects: BoardProject[]): GridWidget[] {
  return projectCatalog(projects).map((entry) => entry.widget)
}

/* A widget that isn't on the board, ready to add or drag back in at any free spot */
export function unplaced(widget: GridWidget): Omit<GridWidget, 'x' | 'y'> {
  const { x: _x, y: _y, ...rest } = widget
  return rest
}

/* Applies the hand-placed position, or leaves x and y off so the grid finds a free spot */
function place(widget: Omit<GridWidget, 'x' | 'y' | 'w' | 'h'> & { w: number; h: number }): GridWidget {
  const spot = DEFAULT_PLACEMENT[widget.id]
  if (!spot) return { ...widget, x: 0, y: 1000 } as GridWidget
  const [x, y, w, h] = spot
  return { ...widget, x, y, w, h } as GridWidget
}
