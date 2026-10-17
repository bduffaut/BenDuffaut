<!-- Five widgets rearranging on a 6×4 grid through three layouts, like the real library -->
<template>
  <div class="relative aspect-[16/9] w-full p-5">
    <div class="board">
      <span v-for="n in 5" :key="n" :class="`w w${n}`">
        <span class="w__bar" />
        <span v-if="n === 1" class="w__chart" />
        <span v-else-if="n === 5" class="w__rows" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.board {
  position: relative;
  height: 100%;
  background-image:
    linear-gradient(to right, rgb(45 212 191 / 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(45 212 191 / 0.06) 1px, transparent 1px);
  background-size: calc(100% / 6) 25%;
  outline: 1px dashed rgb(45 212 191 / 0.15);
}

.w {
  position: absolute;
  padding: 4px;
  animation: 12s var(--ease-out-expo) infinite;
}

.w::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface-2);
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  transition: border-color 0.3s;
}

.w__bar {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 34%;
  height: 4px;
  background: var(--color-border-strong);
  border-radius: 2px;
}

.w__chart {
  position: absolute;
  inset: 26px 12px 12px;
  background: linear-gradient(to top, rgb(34 211 238 / 0.25), transparent);
  clip-path: polygon(0 80%, 15% 55%, 30% 65%, 48% 30%, 62% 45%, 80% 15%, 100% 30%, 100% 100%, 0 100%);
}

.w__rows {
  position: absolute;
  inset: 26px 12px 12px;
  background: repeating-linear-gradient(to bottom, var(--color-border) 0 3px, transparent 3px 11px);
}

/* Layout keyframes: x, y, w, h on a 6 × 4 grid as percentages. A, B, C, then back to A.
   The widget that moves first in each step glows cyan while it's being "dragged". */
/* Base positions are layout A, which is also what reduced motion shows */
.w1 {
  left: 0;
  top: 0;
  width: 50%;
  height: 50%;
  animation-name: w1;
}
.w2 {
  left: 50%;
  top: 0;
  width: 50%;
  height: 25%;
  animation-name: w2;
}
.w3 {
  left: 50%;
  top: 25%;
  width: 50%;
  height: 25%;
  animation-name: w3;
}
.w4 {
  left: 0;
  top: 50%;
  width: 33.333%;
  height: 50%;
  animation-name: w4;
}
.w5 {
  left: 33.333%;
  top: 50%;
  width: 66.666%;
  height: 50%;
  animation-name: w5;
}

@media (prefers-reduced-motion: reduce) {
  .w {
    animation: none;
  }
}

.w1::before,
.w4::before {
  animation: drag 12s infinite;
}

@keyframes drag {
  0%,
  24%,
  36%,
  57%,
  70%,
  100% {
    border-color: var(--color-border-strong);
    filter: none;
  }
  28%,
  32%,
  61%,
  66% {
    border-color: var(--color-cyan);
    filter: drop-shadow(0 0 8px rgb(34 211 238 / 0.5));
  }
}

@keyframes w1 {
  0%,
  25% {
    left: 0;
    top: 0;
    width: 50%;
    height: 50%;
  }
  33%,
  58% {
    left: 50%;
    top: 0;
    width: 50%;
    height: 50%;
  }
  66%,
  91% {
    left: 0;
    top: 50%;
    width: 50%;
    height: 50%;
  }
  100% {
    left: 0;
    top: 0;
    width: 50%;
    height: 50%;
  }
}
@keyframes w2 {
  0%,
  25% {
    left: 50%;
    top: 0;
    width: 50%;
    height: 25%;
  }
  33%,
  58% {
    left: 0;
    top: 0;
    width: 50%;
    height: 25%;
  }
  66%,
  91% {
    left: 50%;
    top: 50%;
    width: 50%;
    height: 25%;
  }
  100% {
    left: 50%;
    top: 0;
    width: 50%;
    height: 25%;
  }
}
@keyframes w3 {
  0%,
  25% {
    left: 50%;
    top: 25%;
    width: 50%;
    height: 25%;
  }
  33%,
  58% {
    left: 0;
    top: 25%;
    width: 50%;
    height: 25%;
  }
  66%,
  91% {
    left: 50%;
    top: 75%;
    width: 50%;
    height: 25%;
  }
  100% {
    left: 50%;
    top: 25%;
    width: 50%;
    height: 25%;
  }
}
@keyframes w4 {
  0%,
  25% {
    left: 0;
    top: 50%;
    width: 33.333%;
    height: 50%;
  }
  33%,
  58% {
    left: 66.666%;
    top: 50%;
    width: 33.333%;
    height: 50%;
  }
  66%,
  91% {
    left: 0;
    top: 0;
    width: 33.333%;
    height: 50%;
  }
  100% {
    left: 0;
    top: 50%;
    width: 33.333%;
    height: 50%;
  }
}
@keyframes w5 {
  0%,
  25% {
    left: 33.333%;
    top: 50%;
    width: 66.666%;
    height: 50%;
  }
  33%,
  58% {
    left: 0;
    top: 50%;
    width: 66.666%;
    height: 50%;
  }
  66%,
  91% {
    left: 33.333%;
    top: 0;
    width: 66.666%;
    height: 50%;
  }
  100% {
    left: 33.333%;
    top: 50%;
    width: 66.666%;
    height: 50%;
  }
}
</style>
