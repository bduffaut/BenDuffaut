<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'

defineProps<{ project: ProjectSummary; large?: boolean }>()
</script>

<template>
  <NuxtLink :to="project.path" class="project-card panel panel--lift group flex h-full flex-col">
    <ProjectVisual :visual="project.visual ?? 'none'" class="border-b border-border" />
    <div class="flex flex-1 flex-col p-6">
      <div class="flex items-center gap-3">
        <UiStatusChip :status="project.status ?? 'shipped'" />
        <span class="font-meta text-xs text-faint">{{ project.period }}</span>
        <ArrowUpRight
          :size="18"
          class="ml-auto text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        />
      </div>
      <h3 class="mt-4 text-text" :class="large ? 'text-2xl' : 'text-xl'">{{ project.title }}</h3>
      <p class="mt-2 text-muted">{{ project.tagline }}</p>

      <dl v-if="large && project.metrics?.length" class="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5">
        <div v-for="metric in project.metrics" :key="metric.label">
          <dt class="sr-only">{{ metric.label }}</dt>
          <dd class="glow font-display text-xl font-semibold text-data md:text-2xl"><UiCountUp :value="metric.value" /></dd>
          <dd class="mt-1 text-xs leading-snug text-faint">{{ metric.label }}</dd>
        </div>
      </dl>

      <ul class="mt-auto flex flex-wrap gap-2 pt-5" aria-label="Technologies">
        <li v-for="tech in project.stack.slice(0, large ? 6 : 4)" :key="tech" class="chip">{{ tech }}</li>
      </ul>
    </div>
  </NuxtLink>
</template>
