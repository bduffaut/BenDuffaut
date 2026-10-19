<script setup lang="ts">
import type { Component } from 'vue'
// Picks the animated illustration for a project. Add a new visual by creating
// components/project/visual/<Name>.vue and adding it to the `visual` enum in content.config.ts.
import Grid from './visual/Grid.vue'
import Tennis from './visual/Tennis.vue'
import News from './visual/News.vue'
import Mutation from './visual/Mutation.vue'
import Components from './visual/Components.vue'
import Site from './visual/Site.vue'
import Homelab from './visual/Homelab.vue'

const props = defineProps<{ visual: string }>()

const VISUALS: Record<string, Component> = {
  grid: Grid,
  tennis: Tennis,
  news: News,
  mutation: Mutation,
  components: Components,
  site: Site,
  homelab: Homelab,
}

const component = computed(() => VISUALS[props.visual])
</script>

<template>
  <div v-if="component" class="visual" aria-hidden="true">
    <component :is="component" />
  </div>
</template>

<style scoped>
.visual {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 80% 0%, rgb(45 212 191 / 0.08), transparent 60%),
    linear-gradient(var(--color-bg-deep), var(--color-surface));
}

/* Dot grid behind every visual */
.visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px);
  background-size: 14px 14px;
  mask-image: linear-gradient(to bottom, #000, transparent 95%);
}
</style>
