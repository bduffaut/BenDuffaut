<!-- An answer gets mutated, and the judge's score drops when it should -->
<template>
  <div class="relative flex aspect-[16/9] w-full flex-col justify-center gap-4 p-6 font-mono text-[0.72rem]">
    <p class="line">
      <span class="text-faint">answer</span>
      <span class="text-muted">The Eiffel Tower is in </span>
      <span class="swap"><span class="a">Paris</span><span class="b">Rome</span></span>
      <span class="text-muted">.</span>
    </p>
    <div>
      <div class="flex justify-between text-faint">
        <span>judge score</span>
        <span class="score"><span class="a">0.94</span><span class="b">0.31</span></span>
      </div>
      <div class="track"><span class="bar" /></div>
    </div>
    <p class="verdict"><span class="led" style="--led: var(--color-good); width: 6px; height: 6px" /> mutation detected</p>
  </div>
</template>

<style scoped>
.line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 0.5rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
}

.swap,
.score {
  display: inline-grid;
}

.swap > *,
.score > * {
  grid-area: 1 / 1;
  animation: 5s ease-in-out infinite;
}

.swap .a,
.score .a {
  animation-name: out;
}

.swap .b,
.score .b {
  animation-name: in;
}

.swap .a {
  color: var(--color-text);
}

.swap .b {
  color: var(--color-warning);
  text-decoration: underline wavy;
  text-underline-offset: 3px;
}

.score .a {
  color: var(--color-cyan);
}

.score .b {
  color: var(--color-warning);
}

@keyframes out {
  0%,
  35% {
    opacity: 1;
  }
  40%,
  92% {
    opacity: 0;
  }
}

@keyframes in {
  0%,
  35% {
    opacity: 0;
  }
  40%,
  92% {
    opacity: 1;
  }
}

.track {
  height: 6px;
  margin-top: 0.4rem;
  background: rgb(255 255 255 / 0.05);
}

.bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, rgb(34 211 238 / 0.2), var(--color-cyan));
  box-shadow: 3px 0 10px -2px var(--cyan-glow);
  animation: bar 5s ease-in-out infinite;
}

@keyframes bar {
  0%,
  38% {
    width: 94%;
  }
  48%,
  92% {
    width: 31%;
  }
  100% {
    width: 94%;
  }
}

.verdict {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-good);
  animation: verdict 5s ease-in-out infinite;
}

@keyframes verdict {
  0%,
  50% {
    opacity: 0;
  }
  58%,
  92% {
    opacity: 1;
  }
}
</style>
