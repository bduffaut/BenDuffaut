<script setup lang="ts">
const { data: experience } = await useExperience()
</script>

<template>
  <section id="experience" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8">
    <UiSectionHeading index="01" label="Experience" title="Where I've worked" />

    <ol class="timeline">
      <li v-for="(job, i) in experience" :key="job.id" v-reveal="i * 80" class="timeline__item">
        <span class="timeline__node" aria-hidden="true" />
        <p class="mb-3 font-mono text-xs tracking-wider text-faint uppercase md:mb-0 md:pt-6">{{ dateRange(job.start, job.end) }}</p>

        <article v-spotlight class="panel panel--lift p-6 md:p-7">
          <header class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 class="text-xl text-text">{{ job.role }}</h3>
            <span class="font-display text-accent">@ {{ job.company }}</span>
            <span class="w-full font-mono text-xs text-faint md:ml-auto md:w-auto">{{ job.location }}</span>
          </header>
          <p v-if="job.summary" class="mt-3 text-muted">{{ job.summary }}</p>
          <ul class="mt-4 space-y-2.5 text-[0.95rem] text-muted">
            <li v-for="point in job.highlights" :key="point" class="bullet">{{ point }}</li>
          </ul>
          <ul v-if="job.stack?.length" class="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
            <li v-for="tech in job.stack" :key="tech" class="chip">{{ tech }}</li>
          </ul>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  display: grid;
  gap: 1.5rem;
}

/* The rail fades in from the top and out at the bottom */
.timeline::before {
  content: '';
  position: absolute;
  top: 0.5rem;
  bottom: 0;
  left: 5px;
  width: 1px;
  background: linear-gradient(to bottom, var(--color-accent), var(--color-cyan) 40%, var(--color-border) 85%, transparent);
}

.timeline__item {
  position: relative;
  padding-left: 2rem;
}

@media (min-width: 768px) {
  .timeline::before {
    left: calc(9rem + 5px);
  }

  .timeline__item {
    display: grid;
    grid-template-columns: 9rem 1fr;
    gap: 2.5rem;
    padding-left: 0;
  }

  .timeline__node {
    left: calc(9rem) !important;
  }
}

.timeline__node {
  position: absolute;
  top: 0.35rem;
  left: 0;
  width: 11px;
  height: 11px;
  border: 2px solid var(--color-accent);
  background: var(--color-bg);
  rotate: 45deg;
  box-shadow: 0 0 12px var(--accent-glow);
}

@media (min-width: 768px) {
  .timeline__node {
    top: 1.75rem;
  }
}

.bullet {
  position: relative;
  padding-left: 1.2rem;
}

.bullet::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 7px;
  height: 1px;
  background: var(--color-accent);
  box-shadow: 0 0 6px var(--color-accent);
}
</style>
