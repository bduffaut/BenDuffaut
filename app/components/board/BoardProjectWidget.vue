<script setup lang="ts">
// One project on the board. It shows more as it gets bigger, like the widgets in the Sentinel
// demo: tagline and status when small, then the animated visual, then the stack, then the
// metrics. Container queries on the frame body decide what fits, so any size looks deliberate.

const props = defineProps<{ slug: string }>()

const projects = inject(PROJECTS_BY_SLUG)
const project = computed(() => projects?.value.get(props.slug))
</script>

<template>
  <BoardFrame
    v-if="project"
    :title="project.title"
    :icon="projectIcon(project.visual)"
    :to="project.path"
    :live="project.status === 'in-progress'"
  >
    <div class="pw">
      <ProjectVisual v-if="project.visual && project.visual !== 'none'" :visual="project.visual" class="pw__visual" />
      <div class="pw__info">
        <p class="pw__tagline">{{ project.tagline }}</p>

        <dl v-if="project.metrics?.length" class="pw__metrics">
          <div v-for="metric in project.metrics" :key="metric.label" class="min-w-0">
            <dt class="sr-only">{{ metric.label }}</dt>
            <dd class="glow font-display text-xl font-semibold text-data"><UiCountUp :value="metric.value" /></dd>
            <dd class="mt-0.5 truncate text-xs text-faint">{{ metric.label }}</dd>
          </div>
        </dl>

        <div class="pw__meta">
          <UiStatusChip :status="project.status ?? 'shipped'" />
          <span class="pw__period truncate font-meta text-xs text-faint">{{ project.period }}</span>
        </div>

        <ul class="pw__stack" aria-label="Technologies">
          <li v-for="tech in project.stack" :key="tech" class="chip">{{ tech }}</li>
        </ul>
      </div>
    </div>
  </BoardFrame>
</template>

<style scoped>
.pw {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pw__visual {
  display: none;
  flex: 1;
  min-height: 0;
  border-bottom: 1px solid var(--color-border);
}

/* The visuals are drawn at 16:9, here they fill whatever height the widget gives them */
.pw__visual > :deep(div) {
  aspect-ratio: auto;
  height: 100%;
}

.pw__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  padding: 14px 16px 16px;
}

.pw__tagline {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--color-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.pw__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.pw__metrics,
.pw__stack {
  display: none;
}

.pw__metrics {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 10px 0 2px;
  border-top: 1px solid var(--color-border);
}

.pw__stack {
  flex-wrap: wrap;
  gap: 6px;
  max-height: 58px;
  overflow: hidden;
}

/* Tiny: one line of tagline and nothing else */
@container (max-height: 110px) {
  .pw__tagline {
    -webkit-line-clamp: 1;
  }
  .pw__meta {
    display: none;
  }
}

/* Narrow (side by side on phones): a longer tagline instead of a date that won't fit */
@container (max-width: 200px) {
  .pw__tagline {
    -webkit-line-clamp: 3;
  }
  .pw__period {
    display: none;
  }
}

/* Tall enough for the animated visual */
@container (min-height: 230px) {
  .pw__visual {
    display: block;
  }
}

/* Room for the stack under the visual */
@container (min-height: 300px) {
  .pw__stack {
    display: flex;
  }
}

/* Big: the headline numbers too */
@container (min-width: 440px) and (min-height: 380px) {
  .pw__metrics {
    display: grid;
  }
}

/* Wide and short: visual beside the text instead of above it */
@container (min-width: 560px) and (max-height: 229px) and (min-height: 150px) {
  .pw {
    flex-direction: row;
  }
  .pw__visual {
    display: block;
    flex: 0 0 42%;
    border-bottom: 0;
    border-right: 1px solid var(--color-border);
  }
  .pw__info {
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
}
</style>
