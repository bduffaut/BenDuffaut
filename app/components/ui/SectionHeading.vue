<script setup lang="ts">
// Numbered section title: "01 // Experience" above a display heading. The section-heading
// classes are hooks for themes (app/assets/css/themes/)
defineProps<{ index: string; label: string; title: string; lede?: string }>()
</script>

<template>
  <header v-reveal class="section-heading mb-10 max-w-3xl md:mb-14">
    <p class="eyebrow flex items-center gap-3">
      <span class="section-heading__index text-faint">{{ index }}</span>
      <span class="section-heading__rule h-px w-8 bg-gradient-to-r from-accent to-transparent" aria-hidden="true" />
      {{ label }}
    </p>
    <h2 class="section-heading__title mt-4 text-3xl text-text md:text-[2.6rem]">{{ title }}</h2>
    <p v-if="lede" class="mt-4 text-lg text-muted">{{ lede }}</p>
  </header>
</template>
