import type { GridWidget } from 'custom-dashboard-grid'

// The home page's project board, which runs on custom-dashboard-grid.
//
// Two widget types:
//   project  one project, showing more (visual, metrics, stack) as it gets bigger
//   stat     one headline number from a project's `metrics`, as a small KPI tile
//
// The default arrangement is designed by hand on 12 columns with 52px rows. Featured projects
// that aren't in it yet (added later in content/) are placed in the first free spot.
//
// Phones get their own hand-placed board on 6 columns rather than a single stacked list, so it
// still reads as a dashboard: wide project tiles, two projects side by side, and stat tiles in
// pairs. 6 rather than 2 because projects can't go below 3 columns or stats below 2.

export const PROJECT_LAYOUT_VERSION = 3

/* The board's breakpoints, by the board's own width. `phone` matches PHONE_PLACEMENT below. */
export const BOARD_BREAKPOINTS = { lg: { width: 700, columns: 12 }, phone: { width: 0, columns: 6 } }

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
  // Big enough to show the network map, the stack and the numbers, with two stat tiles beside it
  homelab: [0, 12, 8, 6],
  'stat-homelab-0': [8, 12, 4, 3],
  'stat-homelab-1': [8, 15, 4, 3],
}

/* Hand-placed phone board, 6 columns, in reading order: x, y, w, h per widget id */
const PHONE_PLACEMENT: Record<string, [x: number, y: number, w: number, h: number]> = {
  'dashboard-grid': [0, 0, 6, 6],
  'stat-dashboard-grid-0': [0, 6, 3, 3],
  'stat-tennistracker-0': [3, 6, 3, 3],
  tennistracker: [0, 9, 6, 5],
  'news-briefing': [0, 14, 6, 5],
  // Compact side-by-side cards: too narrow for a visual, so title, tagline and status only
  mtlj: [0, 19, 3, 3],
  'mode-surface': [3, 19, 3, 3],
  homelab: [0, 22, 6, 6],
  'stat-homelab-0': [0, 28, 3, 3],
  'stat-homelab-1': [3, 28, 3, 3],
}

/* Which project metrics get their own stat tile: [project slug, index into its metrics] */
const STAT_TILES: [slug: string, metric: number][] = [
  ['tennistracker', 0],
  ['dashboard-grid', 0],
  ['homelab', 0],
  ['homelab', 1],
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

/* Applies the hand-placed positions, or leaves x and y off so the grid finds a free spot.
   Widgets without a phone spot fall back to the grid's list layout on phones. */
function place(widget: Omit<GridWidget, 'x' | 'y' | 'w' | 'h'> & { w: number; h: number }): GridWidget {
  const phone = PHONE_PLACEMENT[widget.id]
  const breakpoints = phone ? { phone: { x: phone[0], y: phone[1], w: phone[2], h: phone[3] } } : undefined
  const spot = DEFAULT_PLACEMENT[widget.id]
  if (!spot) return { ...widget, x: 0, y: 1000, ...(breakpoints && { breakpoints }) } as GridWidget
  const [x, y, w, h] = spot
  return { ...widget, x, y, w, h, ...(breakpoints && { breakpoints }) } as GridWidget
}
