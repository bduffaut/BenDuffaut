<script setup lang="ts">
import type { Component } from 'vue'
import { PIN_MODE_OPTIONS, useWidget } from 'custom-dashboard-grid'
import { ArrowUpRight, ChevronDown, ChevronRight, Lock, Move, Pin, X } from 'lucide-vue-next'

// Shared frame for every widget on the project board, ported from the Sentinel demo's
// WidgetCard. Everything it needs comes from useWidget. In view mode the body links to `to`;
// in edit mode it's a plain block so dragging never follows the link.

const props = defineProps<{
  title: string
  icon?: Component
  to?: string
  /* Accessible name of the link, defaults to "Open <title>" */
  linkLabel?: string
  /* Pulsing light in the header, for work that's still going */
  live?: boolean
}>()

const { widget, interaction, editable, collapsed, selected, remove, collapse, pinMode } = useWidget()

const NuxtLink = resolveComponent('NuxtLink')
const bodyIs = computed(() => (props.to && !editable.value ? NuxtLink : 'div'))

// In view mode a small icon shows how the widget is pinned, labelled by the library
const PIN_ICONS = { pinned: Pin, locked: Lock, 'no-resize': Move } as const
const pinBadge = computed(() => {
  if (pinMode.value === 'free') return null
  const option = PIN_MODE_OPTIONS.find((o) => o.mode === pinMode.value)!
  return { icon: PIN_ICONS[pinMode.value], label: `${option.label}: ${option.description}` }
})

// Live grid position or size while dragging or resizing
const readout = computed(() => {
  const w = widget.value
  return interaction.value === 'resize' ? `${w.w} × ${w.h}` : `col ${w.x + 1}, row ${w.y + 1}`
})
</script>

<template>
  <section
    class="frame panel"
    :class="{
      'frame--active': interaction,
      'frame--editing': editable,
      'frame--pinned': pinMode !== 'free',
      'frame--selected': selected,
    }"
  >
    <header class="frame__header">
      <button class="frame__btn" :aria-label="collapsed ? `Expand ${title}` : `Collapse ${title}`" @click="collapse()">
        <ChevronRight v-if="collapsed" :size="14" />
        <ChevronDown v-else :size="14" />
      </button>
      <component :is="icon" v-if="icon" class="frame__icon" :size="15" aria-hidden="true" />
      <h3 class="frame__title">{{ title }}</h3>
      <span v-if="live" class="led frame__led" role="img" aria-label="In progress" />
      <span v-if="interaction" class="frame__readout">{{ readout }}</span>

      <div class="frame__actions">
        <template v-if="editable">
          <BoardPinMenu />
          <button
            v-if="pinMode !== 'locked'"
            class="frame__btn frame__remove"
            :aria-label="`Remove ${title}`"
            title="Remove"
            @click="remove"
          >
            <X :size="14" />
          </button>
        </template>
        <template v-else>
          <component :is="pinBadge.icon" v-if="pinBadge" class="frame__pin" :size="13" :aria-label="pinBadge.label" />
          <NuxtLink v-if="to" :to="to" class="frame__btn frame__open" tabindex="-1" aria-hidden="true">
            <ArrowUpRight :size="15" />
          </NuxtLink>
        </template>
      </div>
    </header>

    <component
      :is="bodyIs"
      v-show="!collapsed"
      :to="bodyIs === 'div' ? undefined : to"
      :aria-label="bodyIs === 'div' ? undefined : (linkLabel ?? `Open ${title}`)"
      class="frame__body"
    >
      <slot />
    </component>
  </section>
</template>

<style scoped>
.frame {
  --chamfer: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  container: frame / inline-size;
}

/* Narrow tiles (side by side on phones): the title needs the room more than the project icon,
   and the status chip in the body already shows what the in-progress light says */
@container frame (max-width: 200px) {
  .frame__icon,
  .frame__led {
    display: none;
  }
}

/* Edit mode registration marks on the three square corners, as in the Sentinel demo */
.frame--editing {
  --fill: var(--color-surface);
}

.frame--editing::before {
  opacity: 1;
  background:
    linear-gradient(var(--color-faint), var(--color-faint)) 3px 3px / 8px 1px no-repeat,
    linear-gradient(var(--color-faint), var(--color-faint)) 3px 3px / 1px 8px no-repeat,
    linear-gradient(var(--color-faint), var(--color-faint)) 3px calc(100% - 3px) / 8px 1px no-repeat,
    linear-gradient(var(--color-faint), var(--color-faint)) 3px calc(100% - 11px) / 1px 8px no-repeat,
    linear-gradient(var(--color-faint), var(--color-faint)) calc(100% - 3px) calc(100% - 3px) / 8px 1px no-repeat,
    linear-gradient(var(--color-faint), var(--color-faint)) calc(100% - 3px) calc(100% - 11px) / 1px 8px no-repeat;
}

.frame--editing .frame__header {
  cursor: grab;
}

.frame--pinned.frame--editing {
  --edge: rgb(45 212 191 / 0.35);
}

.frame--selected,
.frame--active {
  --edge: var(--color-accent);
  --corner: var(--color-accent);
}

.frame--selected .frame__header {
  background: var(--accent-soft);
}

.frame--active {
  --fill: var(--color-surface-2);
  cursor: grabbing;
}

.frame__header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 calc(var(--chamfer) - 2px) 0 4px;
  border-bottom: 1px solid var(--color-border);
  user-select: none;
}

.frame__icon {
  flex-shrink: 0;
  color: var(--color-accent);
  transition: transform 0.3s var(--ease-spring);
}

/* Lit by the scroll line on touch screens, or hovered with a mouse (see .panel in main.css) */
.frame[data-lit] .frame__icon {
  transform: rotate(-8deg) scale(1.1);
}

@media (hover: hover) {
  .frame:hover .frame__icon {
    transform: rotate(-8deg) scale(1.1);
  }
}

.frame__title {
  min-width: 0;
  overflow: hidden;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--color-text);
}

.frame__led {
  width: 6px;
  height: 6px;
  --led: var(--color-warning);
}

.frame__readout {
  flex-shrink: 0;
  padding: 1px 7px;
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-bg-deep);
  background: var(--color-accent);
}

.frame__actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.frame[data-lit] .frame__actions,
.frame:focus-within .frame__actions,
.frame--editing .frame__actions {
  opacity: 1;
}

@media (hover: hover) {
  .frame:hover .frame__actions {
    opacity: 1;
  }
}

.frame__btn {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  color: var(--color-faint);
  border-radius: 2px;
  cursor: pointer;
  transition:
    color 0.15s,
    background-color 0.15s;
}

.frame__btn:active {
  color: var(--color-text);
  background: var(--color-surface-3);
}

.frame__open svg {
  transition: transform 0.3s var(--ease-spring);
}

.frame[data-lit] .frame__open {
  color: var(--color-accent);
}

.frame[data-lit] .frame__open svg {
  transform: translate(1px, -1px);
}

@media (hover: hover) {
  .frame__btn:hover {
    color: var(--color-text);
    background: var(--color-surface-3);
  }

  .frame__remove:hover {
    color: #ec835a;
  }

  .frame:hover .frame__open {
    color: var(--color-accent);
  }

  .frame:hover .frame__open svg {
    transform: translate(1px, -1px);
  }
}

.frame__pin {
  margin-right: 4px;
  color: var(--color-faint);
}

/* Size container, so what's inside can show more as the widget grows */
.frame__body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  container-type: size;
  color: inherit;
}
</style>
