<script setup lang="ts">
// A headline number from one project, as a KPI tile. The number scales with the tile.

const props = defineProps<{ slug: string; metric: number }>()

const projects = inject(PROJECTS_BY_SLUG)
const project = computed(() => projects?.value.get(props.slug))
const stat = computed(() => project.value?.metrics?.[props.metric])
</script>

<template>
  <BoardFrame
    v-if="project && stat"
    :title="project.title"
    :icon="projectIcon(project.visual)"
    :to="project.path"
    :link-label="`${stat.value} ${stat.label}, ${project.title}`"
  >
    <div class="stat">
      <span class="stat__value glow"><UiCountUp :value="stat.value" /></span>
      <span class="stat__label">{{ stat.label }}</span>
    </div>
  </BoardFrame>
</template>

<style scoped>
.stat {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 6px 16px 10px;
  overflow: hidden;
}

/* A soft cyan bloom behind the number */
.stat::before {
  content: '';
  position: absolute;
  inset: auto -20% -60% 30%;
  height: 140%;
  background: radial-gradient(closest-side, rgb(34 211 238 / 0.12), transparent);
  pointer-events: none;
}

.stat__value {
  position: relative;
  font-family: var(--font-display);
  font-size: clamp(1.25rem, min(42cqh, 20cqw), 4.5rem);
  font-weight: 600;
  line-height: 1.05;
  color: var(--color-cyan);
  white-space: nowrap;
}

.stat__label {
  position: relative;
  overflow: hidden;
  font-size: 0.78rem;
  color: var(--color-faint);
  white-space: nowrap;
  text-overflow: ellipsis;
}

@container (max-height: 60px) {
  .stat__label {
    display: none;
  }
}
</style>
