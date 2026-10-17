<script setup lang="ts">
// Counts the numeric part of a value like "99.8%" or "~24 kB" up from zero when it
// scrolls into view. Prefix, suffix and decimal places are kept from the original.

const props = defineProps<{ value: string }>()

const match = props.value.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/)
const display = ref(props.value)
const el = useTemplateRef<HTMLElement>('el')

onMounted(() => {
  if (!match || !el.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const [, prefix, number, suffix] = match as unknown as [string, string, string, string]
  const target = Number.parseFloat(number)
  const decimals = number.includes('.') ? number.split('.')[1]!.length : 0
  display.value = `${prefix}${(0).toFixed(decimals)}${suffix}`

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    observer.disconnect()
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 1400)
      const eased = 1 - Math.pow(1 - t, 4)
      display.value = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
  observer.observe(el.value)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <span ref="el"
    ><span class="sr-only">{{ value }}</span
    ><span aria-hidden="true">{{ display }}</span></span
  >
</template>
