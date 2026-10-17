<script setup lang="ts">
// Code blocks scroll sideways when lines are long, so they're focusable for keyboard users
defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
  class?: string | null
}>()
</script>

<template>
  <pre :class="$props.class" tabindex="0"><slot /></pre>
</template>
