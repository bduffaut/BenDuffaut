<!-- The deploy pipeline for this site, printed like a terminal session -->
<template>
  <div class="relative flex aspect-[16/9] w-full flex-col justify-center gap-1.5 p-6 font-meta text-[0.72rem]">
    <p v-for="(line, i) in LINES" :key="i" class="line" :style="{ '--i': i }">
      <span :class="line.ok ? 'text-good' : 'text-accent'">{{ line.ok ? '✓' : '$' }}</span>
      <span :class="line.ok ? 'text-muted' : 'text-text'">{{ line.text }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
const LINES = [
  { text: 'git push origin main', ok: false },
  { text: 'lint, typecheck, tests passed', ok: true },
  { text: 'image pushed to ghcr.io', ok: true },
  { text: 'homelab pulled new image', ok: true },
  { text: 'tunnel → benduffaut.com', ok: true },
]
</script>

<style scoped>
.line {
  display: flex;
  gap: 0.7rem;
  animation: line 8s infinite backwards;
  animation-delay: calc(var(--i) * 0.7s);
}

@keyframes line {
  0% {
    opacity: 0;
    translate: -4px 0;
  }
  4%,
  70% {
    opacity: 1;
    translate: 0 0;
  }
  80%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .line {
    animation: none;
  }
}
</style>
