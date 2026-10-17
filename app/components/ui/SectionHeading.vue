<script setup lang="ts">
// Numbered section title: "01 // Experience" in mono above a display heading
defineProps<{ index: string; label: string; title: string; lede?: string }>()
</script>

<template>
  <header v-reveal class="mb-10 max-w-3xl md:mb-14">
    <p class="eyebrow flex items-center gap-3">
      <span class="text-faint">{{ index }}</span>
      <span class="h-px w-8 bg-gradient-to-r from-accent to-transparent" aria-hidden="true" />
      {{ label }}
    </p>
    <h2 class="mt-4 text-3xl text-text md:text-[2.6rem]">{{ title }}</h2>
    <p v-if="lede" class="mt-4 text-lg text-muted">{{ lede }}</p>
  </header>
</template>
