<!--
  The animated backdrop behind every page, inside the fixed .backdrop. Which one runs is up
  to the theme (effects.backdrop in app/themes/index.ts); the effects themselves are in
  app/backdrops/. It switches with the theme, so the new one also gets the new theme's colors,
  and nothing runs with reduced motion: the theme's static backdrop in CSS stays instead.
-->
<template>
  <canvas ref="canvas" class="backdrop__canvas" />
</template>

<script setup lang="ts">
import { BACKDROPS, runBackdrop } from '~/backdrops'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const { theme } = useTheme()

let stop: (() => void) | undefined

onMounted(() => {
  watch(
    () => theme.value.id,
    () => {
      stop?.()
      stop = undefined
      const id = theme.value.effects.backdrop
      if (!id || !canvas.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      stop = runBackdrop(canvas.value, BACKDROPS[id])
    },
    { immediate: true },
  )
})

onBeforeUnmount(() => stop?.())
</script>

<style scoped>
.backdrop__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
