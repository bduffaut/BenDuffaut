<script setup lang="ts">
const { data: groups } = await useSkills()
</script>

<template>
  <section id="skills" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8">
    <UiSectionHeading index="04" label="Skills" title="What I work with" />

    <div v-spotlight class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="(group, i) in groups" :key="group.name" v-reveal="(i % 3) * 70" class="skill-group panel p-5">
        <h3 class="eyebrow">{{ group.name }}</h3>
        <ul class="mt-4 flex flex-wrap gap-2">
          <li v-for="skill in group.items" :key="skill" class="chip">{{ skill }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>
