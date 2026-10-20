<script setup lang="ts">
import type { Component } from 'vue'
// Picks the animated illustration for a project. Add a new visual by creating
// components/project/visual/<Name>.vue and adding it to the `visual` enum in content.config.ts.
import Grid from './visual/Grid.vue'
import Tennis from './visual/Tennis.vue'
import News from './visual/News.vue'
import Mutation from './visual/Mutation.vue'
import Components from './visual/Components.vue'
import Site from './visual/Site.vue'
import Homelab from './visual/Homelab.vue'

const props = defineProps<{ visual: string }>()

const VISUALS: Record<string, Component> = {
  grid: Grid,
  tennis: Tennis,
  news: News,
  mutation: Mutation,
  components: Components,
  site: Site,
  homelab: Homelab,
}

const component = computed(() => VISUALS[props.visual])

// The illustrations loop forever, so they pause while off screen: there can be a dozen on a
// page and only a few are ever in view
const root = useTemplateRef<HTMLElement>('root')
const visible = ref(true)

onMounted(() => {
  if (!root.value) return
  const observer = new IntersectionObserver(([entry]) => (visible.value = entry?.isIntersecting ?? true), { rootMargin: '120px' })
  observer.observe(root.value)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <div v-if="component" ref="root" class="visual" :data-paused="visible ? undefined : ''" aria-hidden="true">
    <component :is="component" />
  </div>
</template>

<style scoped>
.visual {
  position: relative;
  overflow: hidden;
  /* The illustrations animate positions and sizes; containment keeps that layout and paint
     work inside the illustration instead of spreading to the page */
  contain: layout paint;
  background:
    radial-gradient(120% 90% at 80% 0%, color-mix(in srgb, var(--color-accent) 8%, transparent), transparent 60%),
    linear-gradient(var(--color-bg-deep), var(--color-surface));
}

.visual[data-paused] :deep(*),
.visual[data-paused] :deep(*::before),
.visual[data-paused] :deep(*::after) {
  animation-play-state: paused !important;
}

/* Dot grid behind every visual */
.visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(color-mix(in srgb, var(--color-text) 7%, transparent) 1px, transparent 1px);
  background-size: 14px 14px;
  mask-image: linear-gradient(to bottom, #000, transparent 95%);
}
</style>
