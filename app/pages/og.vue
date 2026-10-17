<script setup lang="ts">
// The social preview card. Never linked; scripts/render-assets.mjs screenshots it at
// 1200×630 into /og.png, which every page uses as its og:image.

definePageMeta({ layout: 'bare' })
useSeoMeta({ title: 'Preview', robots: 'noindex, nofollow' })

const profile = await useRequiredProfile()
const host = displayUrl(useRuntimeConfig().public.siteUrl)
</script>

<template>
  <div class="card">
    <div class="grid-bg" />
    <div class="relative flex h-full flex-col justify-between p-[72px]">
      <div class="flex items-center gap-4">
        <span class="mark">BD</span>
        <span class="font-mono text-[22px] tracking-[0.14em] text-accent uppercase">{{ profile.role }}</span>
      </div>
      <div>
        <h1 class="font-display text-[104px] leading-[0.95] font-bold">
          <span class="block text-text">{{ profile.name.split(' ')[0] }}</span>
          <span class="text-gradient block pb-2">{{ profile.name.split(' ').slice(1).join(' ') }}</span>
        </h1>
        <p class="mt-6 max-w-[860px] font-display text-[34px] text-muted">{{ profile.headline }}</p>
      </div>
      <p class="flex items-center gap-3 font-mono text-[22px] text-faint">
        <span class="led" />
        {{ host }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  width: 1200px;
  height: 630px;
  overflow: hidden;
  background:
    radial-gradient(900px 520px at 85% -10%, rgb(45 212 191 / 0.18), transparent 60%),
    radial-gradient(700px 500px at -10% 110%, rgb(129 140 248 / 0.12), transparent 60%), var(--color-bg);
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.045) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 90% 80% at 70% 20%, #000 30%, transparent 80%);
}

.mark {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--color-bg-deep);
  background: var(--gradient-signal);
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
}
</style>
