<!-- Articles stream in, an LLM filter scans them, and the relevant ones light up -->
<template>
  <div class="relative aspect-[16/9] w-full overflow-hidden p-5">
    <div class="feed">
      <article v-for="(item, i) in ITEMS" :key="i" class="card" :class="{ 'card--hit': item.hit }" :style="{ '--i': i }">
        <span class="card__tag">{{ item.topic }}</span>
        <span class="card__line w-[78%]" />
        <span class="card__line w-[52%]" />
        <span v-if="item.hit" class="card__score">relevant {{ item.score }}</span>
      </article>
    </div>
    <span class="scan" />
  </div>
</template>

<script setup lang="ts">
const ITEMS = [
  { topic: 'tech', hit: true, score: '0.93' },
  { topic: 'markets', hit: false },
  { topic: 'sports', hit: true, score: '0.88' },
  { topic: 'world', hit: false },
]
</script>

<style scoped>
.feed {
  display: grid;
  gap: 8px;
  height: 100%;
  grid-template-rows: repeat(4, 1fr);
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 0 14px 0 84px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  animation: 6s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.15s);
}

.card--hit {
  animation-name: hit;
}

.card:not(.card--hit) {
  animation-name: miss;
}

@keyframes hit {
  0%,
  35% {
    border-color: var(--color-border);
    box-shadow: none;
  }
  45%,
  90% {
    border-color: rgb(34 211 238 / 0.7);
    box-shadow: 0 0 18px -4px rgb(34 211 238 / 0.45);
  }
}

@keyframes miss {
  0%,
  35% {
    opacity: 1;
  }
  45%,
  90% {
    opacity: 0.35;
  }
}

.card__tag {
  position: absolute;
  left: 14px;
  top: 50%;
  translate: 0 -50%;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--color-faint);
}

.card__line {
  display: block;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border-strong);
}

.card__score {
  position: absolute;
  right: 12px;
  top: 50%;
  translate: 0 -50%;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--color-cyan);
  opacity: 0;
  animation: score 6s ease-in-out infinite;
}

@keyframes score {
  0%,
  40% {
    opacity: 0;
  }
  50%,
  90% {
    opacity: 1;
  }
}

.scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, rgb(45 212 191 / 0.1) 80%, rgb(45 212 191 / 0.6) 99%, transparent);
  animation: scan 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  pointer-events: none;
}

@keyframes scan {
  0% {
    top: -60px;
    opacity: 1;
  }
  40% {
    top: 100%;
    opacity: 1;
  }
  41%,
  100% {
    opacity: 0;
  }
}
</style>
