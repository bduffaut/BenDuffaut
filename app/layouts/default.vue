<template>
  <div>
    <div class="backdrop" aria-hidden="true">
      <SiteField />
    </div>
    <a href="#main" class="skip-link">Skip to content</a>
    <SiteHeader />
    <main id="main" class="relative">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 100;
  padding: 0.5rem 0.9rem;
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-on-accent);
  background: var(--color-accent);
  translate: 0 -200%;
  transition: translate 0.2s;
}

.skip-link:focus {
  translate: 0 0;
}
</style>
