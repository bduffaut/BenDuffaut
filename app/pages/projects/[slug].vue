<script setup lang="ts">
import { ArrowLeft, ArrowRight, ExternalLink, Play } from 'lucide-vue-next'

const route = useRoute()
const path = computed(() => `/projects/${route.params.slug}`)

const { data: project } = await useAsyncData(`project:${path.value}`, () => queryCollection('projects').path(path.value).first())
if (!project.value) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })

const { data: all } = await useProjects()
const next = computed(() => {
  const list = all.value ?? []
  const index = list.findIndex((p) => p.path === path.value)
  return list[(index + 1) % list.length]
})

useSeoMeta({
  title: () => project.value?.title,
  description: () => project.value?.tagline,
  ogType: 'article',
})

const meta = computed(() =>
  [
    { label: 'Role', value: project.value?.role },
    { label: 'Team', value: project.value?.team },
    { label: 'When', value: project.value?.period },
  ].filter((item) => item.value),
)
</script>

<template>
  <article v-if="project" class="mx-auto max-w-6xl px-5 pt-12 pb-10 md:px-8 md:pt-16">
    <NuxtLink to="/projects" class="btn btn--ghost btn--sm -ml-3">
      <ArrowLeft :size="15" />
      All projects
    </NuxtLink>

    <header class="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
      <div v-reveal>
        <div class="flex flex-wrap items-center gap-3">
          <UiStatusChip :status="project.status ?? 'shipped'" />
          <span class="font-mono text-xs text-faint">{{ project.period }}</span>
        </div>
        <h1 class="mt-5 text-4xl text-text md:text-6xl">{{ project.title }}</h1>
        <p class="mt-5 text-xl text-muted">{{ project.tagline }}</p>
        <div v-if="project.links?.length" class="mt-8 flex flex-wrap gap-3">
          <a
            v-for="(link, i) in project.links"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener"
            class="btn"
            :class="{ 'btn--primary': i === 0 }"
          >
            {{ link.label }}
            <ExternalLink :size="15" />
          </a>
        </div>
      </div>

      <dl v-reveal="100" class="grid gap-x-8 gap-y-5 border-l border-border pl-6 sm:grid-cols-2">
        <div v-for="item in meta" :key="item.label">
          <dt class="eyebrow text-faint!">{{ item.label }}</dt>
          <dd class="mt-1.5 text-text">{{ item.value }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="eyebrow text-faint!">Stack</dt>
          <dd class="mt-2.5 flex flex-wrap gap-2">
            <span v-for="tech in project.stack" :key="tech" class="chip">{{ tech }}</span>
          </dd>
        </div>
      </dl>
    </header>

    <div v-if="project.visual !== 'none' || project.video" v-reveal="150" v-spotlight class="panel mt-14">
      <!-- A real demo video when there is one, otherwise the animated illustration -->
      <video
        v-if="project.video && project.video !== 'pending'"
        :src="project.video"
        class="block w-full"
        autoplay
        muted
        loop
        playsinline
      />
      <div v-else class="relative">
        <ProjectVisual :visual="project.visual ?? 'none'" class="[&>div]:aspect-[21/9]" />
        <p v-if="project.video === 'pending'" class="demo-soon">
          <Play :size="14" />
          Demo video coming soon
        </p>
      </div>
    </div>

    <dl v-if="project.metrics?.length" v-spotlight class="mt-5 grid gap-5 sm:grid-cols-3">
      <div v-for="(metric, i) in project.metrics" :key="metric.label" v-reveal="i * 80" class="panel p-6">
        <dt class="sr-only">{{ metric.label }}</dt>
        <dd class="glow font-display text-4xl font-semibold text-cyan"><UiCountUp :value="metric.value" /></dd>
        <dd class="mt-2 text-sm text-muted">{{ metric.label }}</dd>
      </div>
    </dl>

    <div v-reveal class="prose-site mx-auto mt-16 max-w-3xl">
      <ContentRenderer :value="project" />
    </div>

    <nav v-if="next && next.path !== project.path" class="mx-auto mt-24 max-w-3xl border-t border-border pt-8" aria-label="Next project">
      <NuxtLink :to="next.path" class="group flex items-center gap-4">
        <span class="min-w-0 flex-1">
          <span class="eyebrow text-faint!">Next project</span>
          <span class="mt-2 block font-display text-2xl text-text transition-colors group-hover:text-accent-strong">{{ next.title }}</span>
        </span>
        <ArrowRight :size="22" class="text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
      </NuxtLink>
    </nav>
  </article>
</template>

<style scoped>
.demo-soon {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.8rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-muted);
  border: 1px solid var(--color-border-strong);
  background: rgb(7 10 15 / 0.8);
  backdrop-filter: blur(6px);
}
</style>
