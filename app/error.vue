<script setup lang="ts">
import type { NuxtError } from '#app'
import { ArrowLeft } from 'lucide-vue-next'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: () => (notFound.value ? 'Page not found' : 'Something went wrong'), robots: 'noindex' })
</script>

<template>
  <NuxtLayout>
    <section class="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-start justify-center px-5 md:px-8">
      <p class="eyebrow">Error {{ error.statusCode }}</p>
      <h1 class="mt-4 font-display text-[clamp(4rem,16vw,10rem)] leading-none font-bold">
        <span class="text-gradient">{{ notFound ? '404' : error.statusCode }}</span>
      </h1>
      <p class="mt-6 max-w-md text-lg text-muted">
        {{ notFound ? "That page doesn't exist, or it moved." : 'Something broke on my end. Try again in a moment.' }}
      </p>
      <button class="btn btn--primary mt-8" @click="clearError({ redirect: '/' })">
        <ArrowLeft :size="16" />
        Back home
      </button>
    </section>
  </NuxtLayout>
</template>
