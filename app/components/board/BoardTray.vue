<script setup lang="ts">
import { vDraggableWidget, type GridWidget } from 'custom-dashboard-grid'
import { Plus } from 'lucide-vue-next'

// Widgets taken off the board, shown in edit mode. Drag one back onto the board, or click it
// to drop it in the first free spot. Uses the library's v-draggable-widget.

export interface TrayEntry {
  id: string
  title: string
  kind: 'project' | 'stat'
  widget: Omit<GridWidget, 'x' | 'y'>
}

defineProps<{ entries: TrayEntry[] }>()
const emit = defineEmits<{ add: [entry: TrayEntry] }>()
</script>

<template>
  <div class="tray" role="group" aria-label="Removed widgets">
    <p class="tray__hint">
      <template v-if="entries.length">Removed. Drag one back onto the board, or click to place it:</template>
      <template v-else>Drag the header to move a widget, pull any edge to resize, or drop it on the dock to remove it.</template>
    </p>
    <TransitionGroup name="tray" tag="ul" class="tray__list">
      <li v-for="entry in entries" :key="entry.id">
        <button
          v-draggable-widget="entry.widget"
          class="tray__item"
          :title="`Add ${entry.title}`"
          :aria-label="`Add ${entry.title}`"
          @click="emit('add', entry)"
        >
          <BoardFootprint :w="entry.widget.w" :h="entry.widget.h" />
          <span class="tray__name">{{ entry.title }}</span>
          <span class="tray__kind">{{ entry.kind === 'stat' ? 'stat' : `${entry.widget.w} × ${entry.widget.h}` }}</span>
          <Plus :size="14" class="tray__plus" />
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.tray {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin-bottom: 18px;
  padding: 10px 12px;
  border: 1px dashed color-mix(in srgb, var(--color-accent) 25%, transparent);
  background: color-mix(in srgb, var(--color-accent) 3%, transparent);
  animation: tray-in 0.3s var(--ease-out-expo);
}

@keyframes tray-in {
  from {
    opacity: 0;
    translate: 0 -6px;
  }
}

.tray__hint {
  font-size: 0.82rem;
  color: var(--color-muted);
}

.tray__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tray__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface-2);
  clip-path: var(--clip, polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%));
  cursor: grab;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}

.tray__item:active,
.tray__item:focus-visible {
  border-color: var(--color-accent);
  background: var(--color-surface-3);
}

.tray__item:active :deep(.on),
.tray__item:focus-visible :deep(.on) {
  opacity: 1;
}

@media (hover: hover) {
  .tray__item:hover {
    border-color: var(--color-accent);
    background: var(--color-surface-3);
  }

  .tray__item:hover :deep(.on) {
    opacity: 1;
  }
}

.tray__name {
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.tray__kind {
  font-family: var(--font-meta);
  font-size: 0.7rem;
  color: var(--color-faint);
}

.tray__plus {
  color: var(--color-faint);
  transition:
    color 0.15s,
    transform 0.3s var(--ease-spring);
}

.tray__item:active .tray__plus {
  color: var(--color-accent);
  transform: rotate(90deg);
}

@media (hover: hover) {
  .tray__item:hover .tray__plus {
    color: var(--color-accent);
    transform: rotate(90deg);
  }
}

.tray-enter-active,
.tray-leave-active {
  transition:
    opacity 0.2s,
    scale 0.25s var(--ease-out-expo);
}

.tray-enter-from,
.tray-leave-to {
  opacity: 0;
  scale: 0.9;
}
</style>
