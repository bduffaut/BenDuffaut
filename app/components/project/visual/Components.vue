<!-- A few library primitives, quietly animating: tabs, a switch, an input, a gradient button -->
<template>
  <div class="relative grid aspect-[16/9] w-full place-content-center gap-4 p-6">
    <div class="tabs">
      <span>Overview</span><span>Activity</span><span>Settings</span>
      <i class="tabs__ink" />
    </div>
    <div class="flex items-center gap-4">
      <span class="switch"><i /></span>
      <span class="input"><span class="input__text">mode-surface</span><i class="input__caret" /></span>
    </div>
    <span class="button">MSButton</span>
  </div>
</template>

<style scoped>
.tabs {
  position: relative;
  display: flex;
  gap: 1.2rem;
  padding-bottom: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-muted);
  border-bottom: 1px solid var(--color-border);
}

.tabs__ink {
  position: absolute;
  bottom: -1px;
  height: 2px;
  background: var(--gradient-signal);
  box-shadow: 0 0 8px var(--accent-glow);
  animation: ink 6s var(--ease-out-expo) infinite;
}

@keyframes ink {
  0%,
  28% {
    left: 0;
    width: 4.3em;
  }
  33%,
  61% {
    left: 6.6em;
    width: 4.3em;
  }
  66%,
  95% {
    left: 13.2em;
    width: 4.3em;
  }
  100% {
    left: 0;
    width: 4.3em;
  }
}

.switch {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 999px;
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-strong);
  animation: track 4s ease-in-out infinite;
}

.switch i {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-text);
  animation: knob 4s var(--ease-spring) infinite;
}

@keyframes track {
  45%,
  95% {
    background: rgb(45 212 191 / 0.3);
    border-color: var(--color-accent);
  }
}

@keyframes knob {
  45%,
  95% {
    translate: 16px 0;
    background: var(--color-accent-strong);
  }
}

.input {
  display: inline-flex;
  align-items: center;
  height: 30px;
  min-width: 150px;
  padding: 0 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  border: 1px solid var(--color-cyan);
  box-shadow: 0 0 0 3px rgb(34 211 238 / 0.12);
  background: var(--color-bg-deep);
}

.input__text {
  overflow: hidden;
  white-space: nowrap;
  animation: type 4s steps(12) infinite;
}

@keyframes type {
  0% {
    width: 0;
  }
  50%,
  100% {
    width: 12ch;
  }
}

.input__caret {
  width: 1px;
  height: 14px;
  margin-left: 1px;
  background: var(--color-cyan);
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.button {
  justify-self: start;
  padding: 0.45rem 1rem;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-bg-deep);
  background: linear-gradient(110deg, var(--color-cyan), var(--color-indigo));
  border-radius: 10px;
  box-shadow: 0 0 20px rgb(129 140 248 / 0.3);
}
</style>
