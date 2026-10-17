<script setup lang="ts">
const profile = await useRequiredProfile()
</script>

<template>
  <section id="beyond" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8">
    <UiSectionHeading index="05" label="Off the clock" title="Beyond the code" />

    <div v-spotlight class="grid gap-5 md:grid-cols-[1.3fr_1fr]">
      <article
        v-for="(item, i) in profile.beyond"
        :key="item.title"
        v-reveal="i * 90"
        class="panel panel--lift relative overflow-hidden p-7"
      >
        <span v-if="item.stat" class="rank" aria-hidden="true">{{ item.stat }}</span>
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
  -webkit-text-stroke: 1px rgb(45 212 191 / 0.22);
  pointer-events: none;
}
</style>
