<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'
import { THEME_MENU } from '~/themes'

const NAV = [
  { label: 'Experience', to: '/#experience' },
  { label: 'Projects', to: '/#projects' },
  { label: 'About', to: '/#about' },
  { label: 'Resume', to: '/resume' },
]

const open = ref(false)
const scrolled = ref(false)
const route = useRoute()

watch(
  () => route.fullPath,
  () => (open.value = false),
)

// Section links on the home page are never "current", only real pages are
const isActive = (to: string) => !to.includes('#') && route.path.startsWith(to)

onMounted(() => {
  const onScroll = () => (scrolled.value = window.scrollY > 8)
  onScroll()
  // Escape closes the mobile menu, like any other disclosure
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') open.value = false
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('keydown', onKey)
  })
})
</script>

<template>
  <header class="header" :class="{ 'header--scrolled': scrolled || open }">
    <nav class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 md:px-8" aria-label="Main">
      <!-- Named by its text, so the accessible name always matches what is shown -->
      <NuxtLink to="/" class="brand">
        <span class="brand__mark" aria-hidden="true">BD</span>
        <span class="brand__name sr-only sm:not-sr-only">Ben Duffaut</span>
      </NuxtLink>

      <ul class="ml-auto hidden items-center gap-1 md:flex">
        <li v-for="item in NAV" :key="item.to">
          <NuxtLink :to="item.to" class="nav-link" :class="{ 'is-active': isActive(item.to) }">{{ item.label }}</NuxtLink>
        </li>
      </ul>
      <SiteThemeMenu v-if="THEME_MENU" class="ml-auto md:ml-0" />
      <NuxtLink to="/#contact" class="btn btn--primary btn--sm hidden md:inline-flex">Get in touch</NuxtLink>

      <button
        class="btn btn--ghost btn--icon md:hidden"
        :class="{ 'ml-auto': !THEME_MENU }"
        :aria-expanded="open"
        aria-controls="mobile-nav"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        @click="open = !open"
      >
        <X v-if="open" :size="20" />
        <Menu v-else :size="20" />
      </button>
    </nav>

    <Transition name="drop">
      <div v-if="open" id="mobile-nav" class="border-t border-border px-5 pt-2 pb-6 md:hidden">
        <ul class="flex flex-col">
          <li v-for="item in NAV" :key="item.to">
            <NuxtLink :to="item.to" class="block py-3 font-display text-lg text-text">{{ item.label }}</NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/#contact" class="btn btn--primary mt-3 w-full">Get in touch</NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid transparent;
  transition:
    background-color 0.3s,
    border-color 0.3s,
    backdrop-filter 0.3s;
}

.header--scrolled {
  background: var(--header-bg);
  border-color: var(--color-border);
  backdrop-filter: blur(14px) saturate(1.4);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-on-accent);
  background: var(--gradient-brand);
  clip-path: var(--clip, polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 0 100%));
  transition:
    filter 0.3s,
    transform 0.4s var(--ease-spring);
}

.brand:active .brand__mark {
  filter: drop-shadow(0 0 10px var(--accent-glow)) brightness(1.1);
  transform: rotate(-6deg) scale(1.05);
}

@media (hover: hover) {
  .brand:hover .brand__mark {
    filter: drop-shadow(0 0 10px var(--accent-glow)) brightness(1.1);
    transform: rotate(-6deg) scale(1.05);
  }
}

.brand__name {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Underline that grows from the center, and stays lit on the current page */
.nav-link {
  position: relative;
  display: block;
  padding: 0.45rem 0.8rem;
  font-size: 0.92rem;
  color: var(--color-muted);
  transition: color 0.2s;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0.8rem;
  right: 0.8rem;
  bottom: 0.2rem;
  height: 1px;
  background: var(--gradient-brand);
  box-shadow: 0 0 8px var(--accent-glow);
  scale: 0 1;
  transition: scale 0.35s var(--ease-out-expo);
}

.nav-link:active,
.nav-link.is-active {
  color: var(--color-text);
}

.nav-link:active::after,
.nav-link.is-active::after {
  scale: 1 1;
}

@media (hover: hover) {
  .nav-link:hover {
    color: var(--color-text);
  }

  .nav-link:hover::after {
    scale: 1 1;
  }
}

.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.2s,
    translate 0.25s var(--ease-out-expo);
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  translate: 0 -8px;
}
</style>
