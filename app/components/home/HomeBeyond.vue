<script setup lang="ts">
import { Wrench } from 'lucide-vue-next'

const profile = await useRequiredProfile()

// Picked by `icon` in content/profile.yml, drawn as an outline like the stat figures
const ICONS = { wrench: Wrench }
</script>

<template>
  <section id="beyond" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8">
    <UiSectionHeading index="05" label="Off the clock" title="Beyond the code" />

    <div v-spotlight class="grid gap-5 md:grid-cols-[1.3fr_1fr]">
      <article
        v-for="(item, i) in profile.beyond"
        :key="item.title"
        v-reveal="i * 90"
        class="beyond-card panel panel--lift relative overflow-hidden p-7"
      >
        <span v-if="item.stat" class="rank" aria-hidden="true">{{ item.stat }}</span>
        <component :is="ICONS[item.icon]" v-else-if="item.icon" class="mark" :stroke-width="0.6" aria-hidden="true" />
        <p class="eyebrow relative">{{ item.meta }}</p>
        <h3 class="relative mt-3 text-2xl text-text">{{ item.title }}</h3>
        <p class="relative mt-3 max-w-md text-muted">{{ item.body }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.rank {
  position: absolute;
  right: -0.5rem;
  bottom: -2.5rem;
  font-family: var(--font-display);
  font-size: 9rem;
  font-weight: 700;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--color-accent) 22%, transparent);
  pointer-events: none;
}

/* The icon version of .rank: same thin teal outline. Top right, where the short eyebrow and
   title leave room, so it never sits behind the body text in the narrower card */
.mark {
  position: absolute;
  top: -1.75rem;
  right: -1.5rem;
  width: 9rem;
  height: 9rem;
  color: color-mix(in srgb, var(--color-accent) 22%, transparent);
  rotate: -12deg;
  pointer-events: none;
}
</style>
