<script setup lang="ts">
import { ArrowRight, Check, RotateCcw, SlidersHorizontal } from 'lucide-vue-next'
import { DashboardGrid, reconcileLayout, useLayoutStorage, type DashboardGridApi, type GridWidget } from 'custom-dashboard-grid'
import 'custom-dashboard-grid/style.css'
import BoardProjectWidget from '~/components/board/BoardProjectWidget.vue'
import BoardStatWidget from '~/components/board/BoardStatWidget.vue'
import type { TrayEntry } from '~/components/board/BoardTray.vue'

// The projects section is a live board running on my own library, custom-dashboard-grid,
// set up like its Sentinel demo. Visitors can customize it: drag, resize, pin, remove and
// re-add widgets, undo, auto-arrange. Their board is kept in this browser only.
// Layout and widget catalog: shared/utils/projectLayout.ts

const STORAGE_KEY = 'benduffaut:project-board'
const REMOVED_KEY = `${STORAGE_KEY}:removed`
const OLD_KEYS = ['benduffaut:project-layout']

const { data: projects } = await useProjects()
const featured = computed(() => projects.value?.filter((p) => p.featured) ?? [])

const bySlug = computed(() => new Map(featured.value.map((p) => [projectSlug(p.path), p])))
provide(PROJECTS_BY_SLUG, bySlug)

const boardProjects = computed(() => featured.value.map((p) => ({ slug: projectSlug(p.path), metrics: p.metrics?.length ?? 0 })))
const catalog = computed(() => projectCatalog(boardProjects.value))

const components = { project: markRaw(BoardProjectWidget), stat: markRaw(BoardStatWidget) }

// The full 12-column board down to tablets, then one column in reading order on phones.
// The library's default 6-column middle step leaves gaps with widgets this varied.
const BREAKPOINTS = { lg: { width: 700, columns: 12 }, sm: { width: 0, columns: 1 } }
const grid = useTemplateRef<DashboardGridApi>('grid')
const board = useTemplateRef<HTMLElement>('board')
const editing = ref(false)

// --- Saving ---------------------------------------------------------------------------------
// Nothing is stored until the visitor changes something themselves, so anyone who never
// touches the board always sees my current default layout. Widgets they remove are
// remembered separately, so they stay removed even as the board picks up new projects.

const customized = ref(false)
const removed = ref<string[]>([])

const storage = {
  getItem: (key: string) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  setItem: (key: string, value: string) => customized.value && localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
}

const { widgets, clear } = useLayoutStorage(STORAGE_KEY, () => defaultProjectLayout(boardProjects.value), {
  version: PROJECT_LAYOUT_VERSION,
  // The server and the first client render use the default board, then the saved one loads
  loadOnMount: true,
  storage,
  reconcile: (saved, defaults) => {
    removed.value = readRemoved()
    return reconcileLayout(
      saved,
      defaults.filter((w) => !removed.value.includes(w.id)),
    )
  },
})

function readRemoved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(REMOVED_KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function setRemoved(ids: string[]) {
  removed.value = ids
  try {
    localStorage.setItem(REMOVED_KEY, JSON.stringify(ids))
  } catch {
    // storage blocked, it just won't persist
  }
}

onMounted(() => {
  try {
    customized.value = localStorage.getItem(STORAGE_KEY) !== null
    for (const key of OLD_KEYS) localStorage.removeItem(key)
  } catch {
    // storage blocked
  }
})

function onChange(_changed: GridWidget[], { source }: { source: 'user' | 'auto' }) {
  if (source === 'user') customized.value = true
}

function onRemove(widget: GridWidget) {
  customized.value = true
  if (!removed.value.includes(widget.id)) setRemoved([...removed.value, widget.id])
}

function onAdd(widget: GridWidget) {
  customized.value = true
  if (removed.value.includes(widget.id)) setRemoved(removed.value.filter((id) => id !== widget.id))
}

function reset() {
  clear()
  removed.value = []
  customized.value = false
  try {
    localStorage.removeItem(REMOVED_KEY)
  } catch {
    // nothing to clear
  }
  nextTick(() => grid.value?.playEnter())
}

// --- Widgets off the board ------------------------------------------------------------------

const trayEntries = computed<TrayEntry[]>(() => {
  const onBoard = new Set(widgets.value.map((w) => w.id))
  return catalog.value
    .filter((entry) => !onBoard.has(entry.id))
    .map((entry) => ({ id: entry.id, kind: entry.kind, title: widgetTitle(entry.widget), widget: unplaced(entry.widget) }))
})

function addBack(entry: TrayEntry) {
  grid.value?.addWidget(structuredClone(toRaw(entry.widget)), { scrollIntoView: true })
}

function widgetTitle(widget: Pick<GridWidget, 'id' | 'type' | 'props'>): string {
  const project = bySlug.value.get(String(widget.props?.slug))
  if (!project) return widget.id
  if (widget.type !== 'stat') return project.title
  const metric = project.metrics?.[Number(widget.props?.metric)]
  return metric ? `${metric.value} ${project.title}` : project.title
}

// --- Arrival --------------------------------------------------------------------------------
// Workaround for custom-dashboard-grid 0.2.0 (issue #2): the server renders placeholder
// widths, so transitions stay off until the grid has measured the real ones. Then the board
// waits until it scrolls into view and plays the library's arrival cascade.

const settled = ref(false)
const entered = ref(false)

onMounted(() => {
  let observer: IntersectionObserver | undefined
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      settled.value = true
      if (!board.value) return
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return
          observer?.disconnect()
          entered.value = true
          grid.value?.playEnter()
        },
        { threshold: 0.12 },
      )
      observer.observe(board.value)
    }),
  )
  onBeforeUnmount(() => observer?.disconnect())
})
</script>

<template>
  <section id="projects" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8">
    <UiSectionHeading
      index="02"
      label="Projects"
      title="Things I've built"
      lede="A grid engine I wrote from scratch, applied ML, full-stack apps and the infrastructure that ships them."
    />

    <div v-reveal class="toolbar">
      <p class="flex min-w-0 items-start gap-2.5 text-sm text-muted">
        <span class="led mt-1.5" aria-hidden="true" />
        <span>
          This board runs on
          <NuxtLink
            to="/projects/dashboard-grid"
            class="text-accent-strong underline decoration-accent/40 underline-offset-4 hover:decoration-current"
            >custom-dashboard-grid</NuxtLink
          >, my open source Vue library.
          <span class="hidden sm:inline">Customize it: drag, resize, pin or remove anything.</span>
        </span>
      </p>
      <div class="flex shrink-0 items-center gap-2">
        <button v-if="customized && !editing" class="btn btn--ghost btn--sm" @click="reset">
          <RotateCcw :size="14" />
          Reset
        </button>
        <button class="btn btn--sm" :class="{ 'btn--primary': editing }" :aria-pressed="editing" @click="editing = !editing">
          <Check v-if="editing" :size="14" />
          <SlidersHorizontal v-else :size="14" />
          {{ editing ? 'Done' : 'Customize' }}
        </button>
      </div>
    </div>

    <BoardTray v-if="editing" :entries="trayEntries" @add="addBack" />

    <div
      ref="board"
      v-spotlight
      class="board"
      :class="{ 'board--editing': editing, 'board--settled': settled, 'board--waiting': !entered }"
    >
      <DashboardGrid
        ref="grid"
        v-model="widgets"
        :components="components"
        :editable="editing"
        :breakpoints="BREAKPOINTS"
        breakpoint-layout="list"
        :row-height="52"
        :gap="16"
        resize-handles="all"
        show-cells="editing"
        selectable
        :guides="false"
        :animation="{ preset: 'smooth', enter: 'zip', stagger: 70 }"
        :widget-label="widgetTitle"
        @change="onChange"
        @remove="onRemove"
        @add="onAdd"
      />
    </div>

    <BoardDock v-if="editing" :grid="grid" @reset="reset" @done="editing = false" />

    <div v-reveal class="mt-10 flex justify-center">
      <NuxtLink to="/projects" class="btn">
        All projects
        <ArrowRight :size="16" />
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  margin-bottom: 1.25rem;
}

.board {
  position: relative;
  transition: opacity 0.5s var(--ease-out-expo);
}

.board:not(.board--settled) :deep(.dg-item) {
  transition: none;
}

/* Edit mode: a frame appears around the board and a scan line sweeps down it once,
   like edit mode in the library's demo */
.board::before {
  content: '';
  position: absolute;
  inset: -10px;
  border: 1px dashed transparent;
  pointer-events: none;
  transition: border-color 0.3s;
}

.board--editing::before {
  border-color: rgb(45 212 191 / 0.25);
}

/* The overlay covers the board and the sweep is a 120px band in its background, with the
   bright line at the band's bottom edge. Background position percentages are relative to
   (board height - band height), so 0 -120px puts the line on the board's top edge and 0 100%
   lands it exactly on the bottom edge, whatever the board's height. It never leaves the board. */
.board--editing::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgb(45 212 191 / 0.07) 85%, rgb(45 212 191 / 0.55) 99%, transparent) no-repeat;
  background-size: 100% 120px;
  animation: scan 1.1s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes scan {
  from {
    opacity: 1;
    background-position: 0 -120px;
  }
  85% {
    opacity: 1;
  }
  to {
    opacity: 0;
    background-position: 0 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .board--editing::after {
    display: none;
  }
}
</style>

<style>
/* Hidden until it scrolls into view, then the widgets arrive with the grid's cascade. Only
   with JS, so the server-rendered board is always readable without it. Unscoped on purpose:
   scoped :global(.js) .board--waiting would compile to just .js and hide the whole page. */
.js .board--waiting {
  opacity: 0;
}
</style>
