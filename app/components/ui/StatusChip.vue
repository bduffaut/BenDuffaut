<script setup lang="ts">
defineProps<{ status: 'shipped' | 'in-progress' | 'archived' }>()

const LED = {
  shipped: 'var(--color-good)',
  'in-progress': 'var(--color-warning)',
  archived: 'var(--color-faint)',
}
</script>

<template>
  <span class="chip" :style="{ '--led': LED[status] }">
    <span class="led" :class="{ 'animate-none!': status !== 'in-progress' }" style="width: 6px; height: 6px" aria-hidden="true" />
    {{ STATUS_LABEL[status] }}
  </span>
</template>
