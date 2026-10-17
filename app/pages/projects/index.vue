<script setup lang="ts">
const { data: projects } = await useProjects()
const featured = computed(() => projects.value?.filter((p) => p.featured) ?? [])
const more = computed(() => projects.value?.filter((p) => !p.featured) ?? [])

useSeoMeta({
  title: 'Projects',
  description: 'Projects by Ben Duffaut: a Vue dashboard grid engine, AI tennis analysis, full-stack apps and more.',
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 pt-16 pb-10 md:px-8 md:pt-24">
    <header v-reveal class="max-w-3xl">
      <p class="eyebrow">Projects</p>
      <h1 class="mt-4 text-4xl text-text md:text-6xl">Everything I've built</h1>
      <p class="mt-5 text-lg text-muted">Case studies for the main projects, plus smaller ones from school and on the side.</p>
    </header>

    <div v-spotlight class="mt-14 grid gap-5 md:grid-cols-2">
      <div v-for="(project, i) in featured" :key="project.id" v-reveal="(i % 2) * 90">
        <ProjectCard :project="project" :large="i === 0 || i === 1" />
      </div>
    </div>

    <section v-if="more.length" class="mt-24">
      <h2 v-reveal class="eyebrow">More projects</h2>
      <div v-reveal="80" class="mt-6 border-t border-border">
        <ProjectRow v-for="project in more" :key="project.id" :project="project" />
      </div>
    </section>
  </div>
</template>
