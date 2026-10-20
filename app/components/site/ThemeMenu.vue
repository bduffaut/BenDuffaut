<script setup lang="ts">
import { Check, Palette } from 'lucide-vue-next'

// The theme picker in the header. Picking a theme applies it at once and keeps the menu
// open, so visitors can flip through them; Escape or a click elsewhere closes it.
// Native radio buttons, so arrow keys and screen readers work without extra code.

const { theme, themes, setTheme } = useTheme()
const open = ref(false)
const root = useTemplateRef<HTMLElement>('root')
const toggle = useTemplateRef<HTMLButtonElement>('toggle')

function close(refocus = false) {
  open.value = false
  if (refocus) toggle.value?.focus()
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) close(true)
}

function onPointer(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) close()
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.addEventListener('pointerdown', onPointer)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('pointerdown', onPointer)
})

// The menu opens on the current theme, so arrow keys start from there
watch(open, async (isOpen) => {
  if (!isOpen) return
  await nextTick()
  root.value?.querySelector<HTMLInputElement>('input:checked')?.focus()
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      ref="toggle"
      class="btn btn--ghost btn--icon"
      :aria-expanded="open"
      aria-controls="theme-menu"
      aria-label="Change theme"
      title="Change theme"
      @click="open = !open"
    >
      <Palette :size="18" />
    </button>

    <Transition name="pop">
      <fieldset v-if="open" id="theme-menu" class="menu panel panel--raised">
        <legend class="eyebrow menu__legend">Theme</legend>
        <label v-for="option in themes" :key="option.id" class="option" :class="{ 'is-current': option.id === theme.id }">
          <input
            type="radio"
            name="theme"
            class="sr-only"
            :value="option.id"
            :checked="option.id === theme.id"
            @change="setTheme(option.id)"
          />
          <span class="swatch" aria-hidden="true">
            <span v-for="color in option.swatch" :key="color" :style="{ background: color }" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block font-display text-sm text-text">{{ option.label }}</span>
            <span class="block text-xs text-muted">{{ option.description }}</span>
          </span>
          <Check v-if="option.id === theme.id" :size="16" class="shrink-0 text-accent" aria-hidden="true" />
        </label>
      </fieldset>
    </Transition>
  </div>
</template>

<style scoped>
.menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 60;
  width: min(300px, calc(100vw - 2.5rem));
  padding: 2.4rem 0.5rem 0.5rem;
  box-shadow: var(--shadow-lift);
}

/* A legend can't be positioned by the fieldset's padding, so it's placed over it */
.menu__legend {
  position: absolute;
  top: 0.9rem;
  left: 1rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0.65rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s;
}

.option:has(input:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.option.is-current,
.option:active {
  background: var(--accent-soft);
}

@media (hover: hover) {
  .option:hover {
    background: var(--color-surface-3);
  }

  .option.is-current:hover {
    background: var(--accent-soft);
  }
}

/* Three stripes of the theme's own colors, its background widest */
.swatch {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  flex-shrink: 0;
  width: 40px;
  height: 28px;
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
}

.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.18s,
    translate 0.25s var(--ease-out-expo);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  translate: 0 -6px;
}
</style>
