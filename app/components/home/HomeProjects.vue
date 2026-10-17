<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const { data: projects } = await useProjects()
const featured = computed(() => projects.value?.filter((p) => p.featured) ?? [])

// Bento layout on a 12-column grid: two wide cards, then a row of three
const SPANS = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-4', 'lg:col-span-4', 'lg:col-span-4']
</script>

<template>
  <section id="projects" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8">
    <UiSectionHeading
      index="02"
      label="Projects"
      title="Things I've built"
      lede="A grid engine I wrote from scratch, applied ML, full-stack apps and the infrastructure that ships them."
    />

    <div v-spotlight class="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
      <div v-for="(project, i) in featured" :key="project.id" v-reveal="(i % 3) * 90" :class="SPANS[i] ?? 'lg:col-span-4'">
        <ProjectCard :project="project" :large="i < 2" />
      </div>
    </div>

    <div v-reveal class="mt-10 flex justify-center">
      <NuxtLink to="/projects" class="btn">
        All projects
        <ArrowRight :size="16" />
      </NuxtLink>
    </div>
  </section>
</template>
