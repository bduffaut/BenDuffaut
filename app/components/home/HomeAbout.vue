<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'

const profile = await useRequiredProfile()
const { data: education } = await useEducation()
</script>

<template>
  <section id="about" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8">
    <UiSectionHeading index="03" label="About" title="A bit about me" />

    <div class="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      <div class="space-y-5 text-lg leading-relaxed text-muted">
        <p v-for="(paragraph, i) in profile.about" :key="i" v-reveal="i * 80">{{ paragraph }}</p>
      </div>

      <aside v-reveal="120" v-spotlight class="panel self-start p-6">
        <h3 class="flex items-center gap-2.5 text-lg text-text">
          <GraduationCap :size="18" class="text-accent" />
          Education
        </h3>
        <ol class="mt-5 space-y-6">
          <li v-for="school in education" :key="school.id">
            <p class="font-mono text-xs text-faint">{{ dateRange(school.start, school.end) }} · {{ school.location }}</p>
            <p class="mt-1.5 font-display text-text">{{ school.school }}</p>
            <p class="text-sm text-muted">{{ school.degree }}</p>
            <p v-if="school.detail" class="text-sm text-muted">{{ school.detail }}</p>
            <ul v-if="school.coursework?.length" class="mt-3 flex flex-wrap gap-1.5" aria-label="Coursework">
              <li v-for="course in school.coursework" :key="course" class="chip">{{ course }}</li>
            </ul>
          </li>
        </ol>
      </aside>
    </div>
  </section>
</template>
