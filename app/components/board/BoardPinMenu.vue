<script setup lang="ts">
import type { Component } from 'vue'
import { PIN_MODE_OPTIONS, useWidget, type PinMode } from 'custom-dashboard-grid'
import { Check, Lock, Move, Pin, PinOff } from 'lucide-vue-next'

// Pin button for edit mode, ported from the Sentinel demo. The menu is teleported to the body
// so the widget doesn't clip it. Modes and their labels come from the library and are undoable.

const { pinMode, setPinMode } = useWidget()

const ICONS: Record<PinMode, Component> = { free: PinOff, pinned: Pin, locked: Lock, 'no-resize': Move }
const current = computed(() => PIN_MODE_OPTIONS.find((o) => o.mode === pinMode.value) ?? PIN_MODE_OPTIONS[0]!)

const WIDTH = 270
const open = ref(false)
const button = useTemplateRef<HTMLButtonElement>('button')
const panel = useTemplateRef<HTMLElement>('panel')
const position = ref({ top: 0, left: 0 })

function place() {
  const rect = button.value?.getBoundingClientRect()
  if (!rect) return
  const left = Math.min(Math.max(8, rect.right - WIDTH), window.innerWidth - WIDTH - 8)
  const below = rect.bottom + 6
  // Open upward when there's no room below
  position.value = { top: below + 230 > window.innerHeight ? Math.max(8, rect.top - 236) : below, left }
}

function toggle() {
  if (!open.value) place()
  open.value = !open.value
}

function choose(mode: PinMode) {
  setPinMode(mode)
  open.value = false
}

const close = () => (open.value = false)
function onOutside(event: PointerEvent) {
  const target = event.target as Node
  if (!panel.value?.contains(target) && !button.value?.contains(target)) close()
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
  } else {
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('scroll', close, true)
    window.removeEventListener('resize', close)
  }
})
onBeforeUnmount(close)
</script>

<template>
  <button
    ref="button"
    class="pin-btn"
    :class="[`is-${pinMode}`, { 'is-open': open }]"
    :title="`${current.label}. Click to change.`"
    :aria-label="`Pin mode: ${current.label}`"
    :aria-expanded="open"
    aria-haspopup="menu"
    @click="toggle"
  >
    <component :is="ICONS[current.mode]" :size="13" />
  </button>
  <Teleport to="body">
    <div
      v-if="open"
      ref="panel"
      class="pin-menu"
      role="menu"
      :style="{ top: `${position.top}px`, left: `${position.left}px`, width: `${WIDTH}px` }"
    >
      <button
        v-for="option in PIN_MODE_OPTIONS"
        :key="option.mode"
        class="pin-menu__item"
        :class="{ 'is-current': option.mode === pinMode }"
        role="menuitemradio"
        :aria-checked="option.mode === pinMode"
        @click="choose(option.mode)"
      >
        <component :is="ICONS[option.mode]" :size="15" class="pin-menu__icon" />
        <span class="flex flex-1 flex-col gap-0.5 text-left">
          <span class="text-[0.82rem] font-semibold text-text">{{ option.label }}</span>
          <span class="text-xs text-muted">{{ option.description }}</span>
        </span>
        <Check v-if="option.mode === pinMode" :size="14" class="mt-0.5 shrink-0 text-accent" />
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.pin-btn {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  color: var(--color-faint);
  border-radius: 2px;
  cursor: pointer;
}

.pin-btn:active,
.pin-btn.is-open {
  color: var(--color-text);
  background: var(--color-surface-3);
}

@media (hover: hover) {
  .pin-btn:hover {
    color: var(--color-text);
    background: var(--color-surface-3);
  }
}

/* Any mode other than free stands out */
.pin-btn.is-pinned,
.pin-btn.is-locked,
.pin-btn.is-no-resize {
  color: var(--color-accent);
}

.pin-menu {
  position: fixed;
  z-index: 1000;
  padding: 6px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  clip-path: polygon(0 0, calc(100% - var(--chamfer)) 0, 100% var(--chamfer), 100% 100%, 0 100%);
  filter: drop-shadow(0 18px 30px rgb(0 0 0 / 0.55));
  animation: menu-in 0.18s var(--ease-out-expo);
}

@keyframes menu-in {
  from {
    opacity: 0;
    translate: 0 -4px;
  }
}

.pin-menu__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 8px;
  border-radius: 2px;
  cursor: pointer;
}

.pin-menu__item:active,
.pin-menu__item:focus-visible {
  background: var(--color-surface-3);
}

@media (hover: hover) {
  .pin-menu__item:hover {
    background: var(--color-surface-3);
  }
}

.pin-menu__icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-muted);
}

.pin-menu__item.is-current .pin-menu__icon {
  color: var(--color-accent);
}
</style>
