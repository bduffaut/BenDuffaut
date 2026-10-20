<script setup lang="ts">
const profile = await useRequiredProfile()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer mt-24 border-t border-border">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:px-8">
      <div class="flex flex-col gap-1.5">
        <p class="font-display text-text">{{ profile.name }}</p>
        <p class="font-meta text-xs text-faint">© {{ year }} · Served from a laptop in Orlando through a Cloudflare Tunnel</p>
      </div>
      <div class="flex items-center gap-1 md:ml-auto">
        <a :href="`mailto:${profile.email}`" class="btn btn--ghost btn--sm">{{ profile.email }}</a>
        <a :href="profile.links.github" class="btn btn--ghost btn--icon" target="_blank" rel="noopener" aria-label="GitHub">
          <UiBrandIcon name="github" />
        </a>
        <a :href="profile.links.linkedin" class="btn btn--ghost btn--icon" target="_blank" rel="noopener" aria-label="LinkedIn">
          <UiBrandIcon name="linkedin" />
        </a>
      </div>
    </div>
  </footer>
</template>
