<script setup lang="ts">
// Text that decodes from random glyphs into place, left to right, once on mount.
// Server render, reduced motion and themes without the scramble effect all show the final
// text, and screen readers only ever get the final text.

const props = withDefaults(defineProps<{ text: string; duration?: number; delay?: number }>(), {
  duration: 1100,
  delay: 150,
})

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}#*+=-_'
const shown = ref(props.text)
const { theme } = useTheme()

onMounted(() => {
  if (!theme.value.effects.scramble || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const chars = [...props.text]
  let start = 0
  let frame = 0

  const tick = (now: number) => {
    if (!start) start = now
    const progress = Math.max(0, now - start - props.delay) / props.duration
    shown.value = chars
      .map((char, i) => {
        if (char === ' ' || i / chars.length < progress) return char
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      })
      .join('')
    if (progress < 1) frame = requestAnimationFrame(tick)
    else shown.value = props.text
  }

  frame = requestAnimationFrame(tick)
  onBeforeUnmount(() => cancelAnimationFrame(frame))
})
</script>

<template>
  <span
    ><span class="sr-only">{{ text }}</span
    ><span aria-hidden="true">{{ shown }}</span></span
  >
</template>
