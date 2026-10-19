<script setup lang="ts">
// How much of the 12 columns a widget takes, drawn as a tiny grid. Ported from the Sentinel
// demo's widget library. Parents can light it up on hover with :deep(.on).

const props = withDefaults(defineProps<{ w: number; h: number; columns?: number }>(), { columns: 12 })

const CELL = 4
const GAP = 1
const rows = computed(() => Math.min(props.h, 6))
const width = computed(() => props.columns * (CELL + GAP) - GAP)
const height = computed(() => rows.value * (CELL + GAP) - GAP)
</script>

<template>
  <svg class="footprint" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" aria-hidden="true">
    <template v-for="r in rows" :key="r">
      <rect
        v-for="c in columns"
        :key="c"
        :x="(c - 1) * (CELL + GAP)"
        :y="(r - 1) * (CELL + GAP)"
        :width="CELL"
        :height="CELL"
        :class="c <= w ? 'on' : 'off'"
        :style="{ '--i': c + r }"
      />
    </template>
  </svg>
</template>

<style scoped>
.footprint {
  display: block;
  flex-shrink: 0;
}

rect {
  transition:
    fill 0.25s,
    opacity 0.25s;
  transition-delay: calc(var(--i) * 14ms);
}

.on {
  fill: var(--color-accent);
  opacity: 0.55;
}

.off {
  fill: var(--color-surface-3);
}
</style>
