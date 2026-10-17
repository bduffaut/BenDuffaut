<script setup lang="ts">
import { ArrowLeft, Download } from 'lucide-vue-next'

// The resume, built from the same content as the rest of the site. Entries marked
// `resume: true` in content/ appear here. scripts/render-assets.mjs prints this page
// to /resume.pdf, so the site and the PDF can't drift apart.

definePageMeta({ layout: 'bare' })

const profile = await useRequiredProfile()
const { data: education } = await useEducation()
const { data: experience } = await useExperience()
const { data: skills } = await useSkills()
const { data: projects } = await useProjects()

const resumeEducation = computed(() => education.value?.filter((e) => e.resume) ?? [])
const resumeExperience = computed(() => experience.value?.filter((e) => e.resume) ?? [])
// Defaults inside arrays aren't applied by the content schema, so a missing flag means included
const resumeSkills = computed(() => skills.value?.filter((g) => g.resume !== false) ?? [])
const resumeProjects = computed(() => projects.value?.filter((p) => p.resume) ?? [])
const activities = computed(() => profile.value.beyond.filter((b) => b.resume === true))

const siteHost = computed(() => displayUrl(useRuntimeConfig().public.siteUrl))

useSeoMeta({ title: 'Resume', description: () => `Resume of ${profile.value.name}, ${profile.value.role}.` })
</script>

<template>
  <div class="screen">
    <div class="toolbar">
      <NuxtLink to="/" class="btn btn--ghost btn--sm">
        <ArrowLeft :size="15" />
        benduffaut.com
      </NuxtLink>
      <a href="/resume.pdf" class="btn btn--primary btn--sm" download="Benjamin-Duffaut-Resume.pdf">
        <Download :size="15" />
        Download PDF
      </a>
    </div>

    <article class="paper">
      <header class="text-center">
        <h1 class="name">{{ profile.name }}</h1>
        <p class="contact">
          <span>{{ profile.location }}</span>
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          <a :href="profile.links.linkedin">{{ displayUrl(profile.links.linkedin) }}</a>
          <a :href="profile.links.github">{{ displayUrl(profile.links.github) }}</a>
          <a :href="useRuntimeConfig().public.siteUrl">{{ siteHost }}</a>
        </p>
      </header>

      <section>
        <h2>Education</h2>
        <div v-for="school in resumeEducation" :key="school.id" class="entry">
          <div class="entry__head">
            <strong>{{ school.degree }}</strong>
            <span>{{ dateRange(school.start, school.end) }}</span>
          </div>
          <div class="entry__sub">
            <em
              >{{ school.school }}<template v-if="school.detail"> · {{ school.detail }}</template></em
            >
            <em>{{ school.location }}</em>
          </div>
          <p v-if="school.coursework?.length" class="mt-1"><strong>Relevant coursework:</strong> {{ school.coursework?.join(', ') }}</p>
        </div>
      </section>

      <section>
        <h2>Skills</h2>
        <p v-for="group in resumeSkills" :key="group.name" class="skills">
          <strong>{{ group.name }}:</strong> {{ group.items.join(', ') }}
        </p>
      </section>

      <section>
        <h2>Experience</h2>
        <div v-for="job in resumeExperience" :key="job.id" class="entry">
          <div class="entry__head">
            <strong>{{ job.role }}</strong>
            <span>{{ dateRange(job.start, job.end) }}</span>
          </div>
          <div class="entry__sub">
            <em>{{ job.company }}</em>
            <em>{{ job.location }}</em>
          </div>
          <ul>
            <li v-for="point in job.highlights" :key="point">{{ point }}</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>Projects</h2>
        <div v-for="project in resumeProjects" :key="project.id" class="entry">
          <div class="entry__head">
            <strong>
              {{ project.title }}
              <span class="stack">· {{ project.stack.slice(0, 4).join(', ') }}</span>
            </strong>
            <span>{{ project.period }}</span>
          </div>
          <ul>
            <li v-for="point in project.resumeHighlights" :key="point">{{ point }}</li>
          </ul>
        </div>
      </section>

      <section v-if="activities.length">
        <h2>Activities</h2>
        <div v-for="activity in activities" :key="activity.title" class="entry">
          <div class="entry__head">
            <strong>{{ activity.title }}</strong>
            <span>{{ activity.meta }}</span>
          </div>
          <ul>
            <li>{{ activity.resumeText ?? activity.body }}</li>
          </ul>
        </div>
      </section>
    </article>
  </div>
</template>

<style scoped>
.screen {
  min-height: 100dvh;
  padding: 1.25rem 1rem 4rem;
  background: radial-gradient(900px 500px at 50% -10%, rgb(45 212 191 / 0.08), transparent 60%), var(--color-bg);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  max-width: 8.5in;
  margin: 0 auto 1.25rem;
}

/* US Letter sheet, the same size on screen and in the PDF */
.paper {
  max-width: 8.5in;
  margin: 0 auto;
  padding: 0.36in 0.55in;
  font-family: var(--font-sans);
  font-size: 10pt;
  line-height: 1.3;
  color: #16191d;
  background: #fff;
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.06),
    0 40px 100px -20px rgb(0 0 0 / 0.8);
}

.name {
  font-family: var(--font-display);
  font-size: 24pt;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #0b0f14;
}

.contact {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 0.5rem;
  margin-top: 0.3rem;
  font-size: 9.5pt;
  color: #444b55;
}

.contact > * + *::before {
  content: '|';
  margin-right: 0.5rem;
  color: #a2a9b3;
}

.contact a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: #c0c6ce;
  text-underline-offset: 2px;
}

section {
  margin-top: 0.5rem;
}

h2 {
  padding-bottom: 0.1rem;
  margin-bottom: 0.3rem;
  font-family: var(--font-display);
  font-size: 11.5pt;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0b0f14;
  border-bottom: 1.2px solid #0f766e;
}

.entry + .entry {
  margin-top: 0.45rem;
}

.entry__head,
.entry__sub {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.entry__head span {
  flex-shrink: 0;
  font-size: 9.5pt;
  color: #444b55;
}

.entry__sub {
  font-size: 9.5pt;
  color: #444b55;
}

.stack {
  font-weight: 400;
  font-size: 9.5pt;
  color: #5b636e;
}

ul {
  margin-top: 0.2rem;
  padding-left: 1.05rem;
  list-style: disc;
}

li {
  padding-left: 0.1rem;
}

li + li {
  margin-top: 0.1rem;
}

li::marker {
  color: #0f766e;
}

.skills + .skills {
  margin-top: 0.05rem;
}

@page {
  size: letter;
  margin: 0;
}

@media print {
  :global(html),
  :global(body) {
    background: #fff !important;
  }

  .screen {
    padding: 0;
    background: #fff;
  }

  .toolbar {
    display: none;
  }

  .paper {
    max-width: none;
    box-shadow: none;
  }
}

@media (max-width: 640px) {
  .paper {
    padding: 1.5rem 1.1rem;
  }

  .entry__head,
  .entry__sub {
    flex-direction: column;
    gap: 0;
  }
}
</style>
