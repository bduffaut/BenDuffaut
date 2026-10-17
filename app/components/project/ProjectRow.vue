<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import type { ProjectsCollectionItem } from '@nuxt/content'

// Compact one-line entry for smaller projects
defineProps<{ project: ProjectsCollectionItem }>()
</script>

<template>
  <NuxtLink :to="project.path" class="row group">
    <span class="w-28 shrink-0 font-mono text-xs text-faint">{{ project.period }}</span>
    <span class="min-w-0 flex-1">
      <span class="font-display text-text transition-colors group-hover:text-accent-strong">{{ project.title }}</span>
      <span class="mt-0.5 block text-sm text-muted">{{ project.tagline }}</span>
    </span>
    <span class="hidden gap-2 lg:flex">
      <span v-for="tech in project.stack.slice(0, 3)" :key="tech" class="chip">{{ tech }}</span>
    </span>
    <ArrowRight :size="16" class="shrink-0 text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
  </NuxtLink>
</template>

<style scoped>
.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

/* A wash of light sweeps in from the left on hover */
.row::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, var(--accent-soft), transparent 70%);
  scale: 0 1;
  transform-origin: left;
  transition: scale 0.45s var(--ease-out-expo);
}

.row:hover::before {
  scale: 1 1;
}

@media (max-width: 640px) {
  .row {
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
  }
}
</style>
