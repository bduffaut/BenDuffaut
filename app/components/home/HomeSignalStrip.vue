<script setup lang="ts">
// Decorative live signal, borrowed from the Sentinel demo's header: ticks scroll left
// and fade out, next to the build this page came from. Hidden from assistive tech.

const COUNT = 36
const build = useRuntimeConfig().public.buildSha.slice(0, 7)
const ticks = ref(
  Array.from({ length: COUNT }, (_, i) => 4 + Math.round(Math.abs(Math.sin(i * 1.7) * 14) + Math.abs(Math.cos(i * 0.6)) * 6)),
)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const timer = setInterval(() => {
    ticks.value = [...ticks.value.slice(1), 4 + Math.round(Math.random() * 20)]
  }, 900)
  onBeforeUnmount(() => clearInterval(timer))
})
</script>

<template>
  <div class="flex items-center gap-4 px-4 py-3" aria-hidden="true">
    <svg class="h-7 flex-1" :viewBox="`0 0 ${COUNT * 6} 28`" preserveAspectRatio="none">
      <line x1="0" :x2="COUNT * 6" y1="27.5" y2="27.5" class="stroke-border-strong" />
      <!-- Full-height bars scaled down from the bottom: a transform animates without the
           layout work that changing the height would cost -->
      <rect
        v-for="(h, i) in ticks"
        :key="i"
        :x="i * 6"
        y="0"
        width="3"
        height="28"
        :style="{ transform: `scaleY(${h / 28})` }"
        :class="i === COUNT - 1 ? 'fill-data' : 'fill-accent/40'"
        class="tick"
      />
    </svg>
    <div class="text-right font-meta leading-tight">
      <p class="text-[0.82rem] text-text">{{ build }}</p>
      <p class="text-[0.68rem] text-faint">build</p>
    </div>
  </div>
</template>

<style scoped>
.tick {
  transform-box: fill-box;
  transform-origin: bottom;
  transition: transform 0.7s var(--ease-out-expo);
}

svg {
  mask-image: linear-gradient(to right, transparent, #000 30%);
}
</style>
