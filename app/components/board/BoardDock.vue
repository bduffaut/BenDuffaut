<script setup lang="ts">
import { useDragState, vWidgetTrash, type DashboardGridApi } from 'custom-dashboard-grid'
import { Check, Redo2, RotateCcw, Trash2, Undo2, WandSparkles, X } from 'lucide-vue-next'

// Floating edit-mode toolbar, ported from the Sentinel demo's command dock. It's also a trash
// zone: the library arms it while a widget is dragged and reports when one is over it.

defineProps<{ grid: DashboardGridApi | null }>()
const emit = defineEmits<{ reset: []; done: [] }>()
const drag = useDragState()
</script>

<template>
  <Teleport to="body">
    <div v-widget-trash class="dock" role="toolbar" aria-label="Board layout commands">
      <div class="dock__tools">
        <button class="dock__btn dock__btn--undo" title="Undo (Ctrl+Z)" aria-label="Undo" :disabled="!grid?.canUndo" @click="grid?.undo()">
          <Undo2 :size="16" />
        </button>
        <button class="dock__btn dock__btn--redo" title="Redo (Ctrl+Y)" aria-label="Redo" :disabled="!grid?.canRedo" @click="grid?.redo()">
          <Redo2 :size="16" />
        </button>
        <span class="dock__sep" />
        <button
          class="dock__btn dock__btn--arrange"
          title="Pack every widget into the tightest layout (undoable)"
          @click="grid?.autoArrange()"
        >
          <WandSparkles :size="16" />
          <span class="dock__label">Auto-arrange</span>
        </button>
        <button class="dock__btn dock__btn--reset" title="Back to the default board" @click="emit('reset')">
          <RotateCcw :size="16" />
          <span class="dock__label">Reset</span>
        </button>
        <template v-if="grid?.selection.length">
          <span class="dock__sep" />
          <span class="dock__count">{{ grid.selection.length }} selected</span>
          <button class="dock__btn dock__danger" title="Remove the selected widgets (undoable)" @click="grid.removeWidgets(grid.selection)">
            <Trash2 :size="16" />
            <span class="dock__label">Remove</span>
          </button>
          <button class="dock__btn" title="Clear selection (Escape)" aria-label="Clear selection" @click="grid.clearSelection()">
            <X :size="16" />
          </button>
        </template>
        <span class="dock__sep" />
        <button class="dock__btn dock__done" @click="emit('done')">
          <Check :size="16" />
          <span>Done</span>
        </button>
      </div>
      <div class="dock__drop" aria-hidden="true">
        <Trash2 :size="17" />
        <span>{{ drag.overTrash ? 'Release to remove' : 'Drag here to remove' }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dock {
  position: fixed;
  left: 50%;
  bottom: 20px;
  z-index: 60;
  max-width: calc(100vw - 24px);
  padding: 6px;
  translate: -50% 0;
  border: 1px solid var(--color-border-strong);
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  backdrop-filter: blur(12px) saturate(1.4);
  clip-path: var(--clip, polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%));
  animation: dock-in 0.35s var(--ease-out-expo);
  transition: border-color 0.15s;
}

@keyframes dock-in {
  from {
    opacity: 0;
    translate: -50% 24px;
  }
}

.dock__tools {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dock__sep {
  width: 1px;
  height: 22px;
  margin: 0 4px;
  background: var(--color-border-strong);
}

.dock__btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 34px;
  padding: 0 11px;
  font-size: 0.85rem;
  color: var(--color-muted);
  white-space: nowrap;
  border-radius: 2px;
  cursor: pointer;
  transition:
    color 0.15s,
    background-color 0.15s;
}

.dock__btn:active:not(:disabled) {
  color: var(--color-text);
  background: var(--color-surface-3);
}

@media (hover: hover) {
  .dock__btn:hover:not(:disabled) {
    color: var(--color-text);
    background: var(--color-surface-3);
  }
}

.dock__btn:disabled {
  opacity: 0.35;
  cursor: default;
}

/* Each icon hints at what its button does, on hover with a mouse */
.dock__btn svg {
  transition: transform 0.3s var(--ease-spring);
}

@media (hover: hover) {
  .dock__btn--undo:hover:not(:disabled) svg {
    transform: rotate(-35deg);
  }

  .dock__btn--redo:hover:not(:disabled) svg {
    transform: rotate(35deg);
  }

  .dock__btn--reset:hover svg {
    transform: rotate(-200deg);
    transition-duration: 0.5s;
  }

  .dock__btn--arrange:hover svg {
    animation: wand 0.6s ease-in-out;
  }
}

@keyframes wand {
  25% {
    transform: rotate(-14deg) scale(1.1);
  }
  60% {
    transform: rotate(10deg) scale(1.1);
  }
}

.dock__done {
  font-weight: 600;
  color: var(--color-accent);
  background: var(--accent-soft);
}

.dock__done:active {
  color: var(--color-accent-strong) !important;
  background: color-mix(in srgb, var(--color-accent) 20%, transparent) !important;
}

@media (hover: hover) {
  .dock__done:hover {
    color: var(--color-accent-strong) !important;
    background: color-mix(in srgb, var(--color-accent) 20%, transparent) !important;
  }

  .dock__done:hover svg {
    transform: scale(1.25);
  }
}

.dock__count {
  padding: 0 4px 0 6px;
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-accent);
}

.dock__danger:active {
  color: var(--color-danger) !important;
}

@media (hover: hover) {
  .dock__danger:hover {
    color: var(--color-danger) !important;
  }
}

/* The drop target covers the tools while a widget is being dragged */
.dock__drop {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-danger);
  background:
    repeating-linear-gradient(-45deg, color-mix(in srgb, var(--color-danger-strong) 8%, transparent) 0 8px, transparent 8px 16px),
    var(--color-surface);
}

.dock.dg-trash--armed {
  border-color: color-mix(in srgb, var(--color-danger-strong) 60%, transparent);
}

.dock.dg-trash--armed .dock__drop {
  display: flex;
}

.dock.dg-trash--active {
  border-color: var(--color-danger-strong);
}

.dock.dg-trash--active .dock__drop {
  color: var(--color-text);
  background:
    repeating-linear-gradient(
      -45deg,
      color-mix(in srgb, var(--color-danger-strong) 30%, transparent) 0 8px,
      color-mix(in srgb, var(--color-danger-strong) 18%, transparent) 8px 16px
    ),
    var(--color-surface);
}

@media (max-width: 720px) {
  .dock {
    bottom: 12px;
  }
  .dock__label {
    display: none;
  }
  .dock__btn {
    padding: 0 9px;
  }
}
</style>
