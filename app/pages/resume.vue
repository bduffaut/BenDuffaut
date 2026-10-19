<script setup lang="ts">
import { Download, ExternalLink } from 'lucide-vue-next'

// The resume is my own PDF, public/resume.pdf, shown in the page. It's kept by hand, so
// export it without the phone number: the repo and the site are public. See docs/content.md.

const PDF = '/resume.pdf'
const FILENAME = 'Benjamin-Duffaut-Resume.pdf'

const profile = await useRequiredProfile()

useSeoMeta({ title: 'Resume', description: () => `Resume of ${profile.value.name}, ${profile.value.role}.` })
</script>

<template>
  <div class="mx-auto max-w-4xl px-5 pt-16 pb-20 md:px-8 md:pt-24">
    <header v-reveal class="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="eyebrow">Resume</p>
        <h1 class="mt-4 text-4xl text-text md:text-5xl">{{ profile.name }}</h1>
      </div>
      <div class="flex flex-wrap gap-2">
        <a :href="PDF" target="_blank" rel="noopener" class="btn btn--sm">
          <ExternalLink :size="15" />
          Open in new tab
        </a>
        <a :href="PDF" :download="FILENAME" class="btn btn--primary btn--sm">
          <Download :size="15" />
          Download PDF
        </a>
      </div>
    </header>

    <!-- Client only: Chrome's PDF viewer stays blank in an <object> that was server-rendered and
         then hydrated, so it's created after mount. The empty frame keeps the space meanwhile.
         Browsers that can't show a PDF inside a page (most phones) render the fallback instead. -->
    <ClientOnly>
      <object :data="`${PDF}#view=FitH`" type="application/pdf" class="viewer" aria-label="Resume PDF">
        <div class="viewer__fallback">
          <p class="text-muted">Your browser can't show the PDF here.</p>
          <a :href="PDF" :download="FILENAME" class="btn btn--primary btn--sm">
            <Download :size="15" />
            Download PDF
          </a>
        </div>
      </object>
      <template #fallback>
        <div class="viewer" aria-hidden="true" />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* US Letter proportions, so the page fits the frame without scrolling inside it */
.viewer {
  display: block;
  width: 100%;
  aspect-ratio: 8.5 / 11;
  margin-top: 2.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.viewer__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  padding: 2rem;
  text-align: center;
}
</style>
