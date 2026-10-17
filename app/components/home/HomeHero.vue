<script setup lang="ts">
import { ArrowRight, FileText } from 'lucide-vue-next'

const profile = await useRequiredProfile()
const { data: experience } = await useExperience()
const { data: education } = await useEducation()

const latest = computed(() => experience.value?.[0])
const school = computed(() => education.value?.[0])

const readout = computed(() => [
  { key: 'role', value: 'Full-stack · frontend first' },
  { key: 'base', value: profile.value.location },
  { key: 'edu', value: school.value ? `UCF · CS · ${school.value.end.split(' ').pop()}` : '' },
  { key: 'last', value: latest.value ? `${latest.value.company}` : '' },
  { key: 'stack', value: 'Vue · TypeScript · Node' },
])
</script>

<template>
  <section class="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-16 pb-24 md:px-8 md:pt-24 lg:grid-cols-[1.25fr_1fr] lg:pb-32">
    <div>
      <p v-reveal class="flex flex-wrap items-center gap-3">
        <span v-if="profile.availability.open" class="pill">
          <span class="led" aria-hidden="true" />
          {{ profile.availability.label }}
        </span>
        <span class="eyebrow text-faint!">{{ profile.role }} · {{ profile.location }}</span>
      </p>

      <h1 class="mt-7 text-[clamp(3rem,9vw,5.6rem)] leading-[0.95] font-bold tracking-tight">
        <UiScrambleText :text="profile.name.split(' ')[0]!" class="block text-text" />
        <UiScrambleText :text="profile.name.split(' ').slice(1).join(' ')" :delay="350" class="text-gradient block pb-2" />
      </h1>

      <p v-reveal="120" class="mt-7 max-w-xl font-display text-xl text-text md:text-2xl">{{ profile.headline }}</p>
      <p v-reveal="200" class="mt-4 max-w-xl text-muted">{{ profile.summary }}</p>

      <div v-reveal="280" class="mt-9 flex flex-wrap items-center gap-3">
        <NuxtLink to="/projects" class="btn btn--primary">
          See my work
          <ArrowRight :size="16" />
        </NuxtLink>
        <NuxtLink to="/resume" class="btn">
          <FileText :size="16" />
          Resume
        </NuxtLink>
        <span class="flex">
          <a :href="profile.links.github" class="btn btn--ghost btn--icon" target="_blank" rel="noopener" aria-label="GitHub">
            <UiBrandIcon name="github" />
          </a>
          <a :href="profile.links.linkedin" class="btn btn--ghost btn--icon" target="_blank" rel="noopener" aria-label="LinkedIn">
            <UiBrandIcon name="linkedin" />
          </a>
        </span>
      </div>
    </div>

    <!-- A readout styled like a widget from the dashboard grid demo -->
    <div v-reveal="200" v-spotlight class="panel panel--raised readout">
      <header class="flex h-11 items-center gap-2.5 border-b border-border px-4">
        <span class="led" aria-hidden="true" />
        <span class="font-display text-sm font-semibold">profile.sys</span>
        <span class="ml-auto font-mono text-[0.7rem] text-faint">LIVE</span>
      </header>
      <dl class="divide-y divide-border/70 px-4 py-2 font-mono text-[0.82rem]">
        <div v-for="(row, i) in readout" :key="row.key" class="readout__row" :style="{ '--i': i }">
          <dt class="w-14 shrink-0 text-faint uppercase">{{ row.key }}</dt>
          <dd class="truncate text-text">{{ row.value }}</dd>
        </div>
      </dl>
      <HomeSignalStrip class="border-t border-border" />
    </div>
  </section>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0.85rem 0.3rem 0.7rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-accent-strong);
  border: 1px solid rgb(45 212 191 / 0.3);
  background: var(--accent-soft);
  border-radius: 999px;
  box-shadow: 0 0 24px rgb(45 212 191 / 0.08);
}

.readout {
  --chamfer: 18px;
  box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.7);
}

.readout__row {
  display: flex;
  gap: 1rem;
  padding: 0.62rem 0;
}

/* Rows print in one after another, like a terminal */
.js .readout__row {
  opacity: 0;
  animation: row-in 0.45s var(--ease-out-expo) forwards;
  animation-delay: calc(600ms + var(--i) * 90ms);
}

@keyframes row-in {
  from {
    opacity: 0;
    translate: -6px 0;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}
</style>
