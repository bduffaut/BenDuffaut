<script setup lang="ts">
const config = useRuntimeConfig().public
const route = useRoute()
const profile = await useRequiredProfile()

const canonical = computed(() => `${config.siteUrl}${route.path === '/' ? '' : route.path.replace(/\/$/, '')}`)

useHead({
  titleTemplate: (title) => (title ? `${title} · ${profile.value.shortName}` : `${profile.value.name} · ${profile.value.role}`),
  link: [{ rel: 'canonical', href: canonical }],
  script: [
    // Mark the document before first paint so scroll-reveal content starts hidden. If the app
    // hasn't hydrated within 4s (blocked or failed JS), drop the mark so nothing stays hidden.
    {
      key: 'js-mark',
      innerHTML:
        "document.documentElement.classList.add('js');setTimeout(function(){var d=document.documentElement;if(!d.classList.contains('hydrated'))d.classList.remove('js')},4000)",
    },
    // Self-hosted Umami, proxied through this site (see nuxt.config.ts routeRules)
    ...(config.umamiWebsiteId
      ? [
          {
            key: 'umami',
            src: '/stats/script.js',
            defer: true,
            'data-website-id': config.umamiWebsiteId,
            'data-host-url': '/stats',
            'data-domains': new URL(config.siteUrl).hostname,
          },
        ]
      : []),
  ],
})

useSeoMeta({
  description: () => profile.value.summary,
  ogType: 'website',
  ogSiteName: () => profile.value.name,
  ogUrl: canonical,
  ogImage: `${config.siteUrl}/og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
})

// Structured data so search engines know who the site is about
useHead({
  script: [
    {
      key: 'person-jsonld',
      type: 'application/ld+json',
      innerHTML: () =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profile.value.name,
          jobTitle: profile.value.role,
          url: config.siteUrl,
          email: `mailto:${profile.value.email}`,
          address: { '@type': 'PostalAddress', addressLocality: 'Orlando', addressRegion: 'FL', addressCountry: 'US' },
          alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Central Florida' },
          sameAs: [profile.value.links.github, profile.value.links.linkedin],
        }),
    },
  ],
})
</script>

<template>
  <NuxtLoadingIndicator color="linear-gradient(90deg, #2dd4bf, #22d3ee, #818cf8)" :height="2" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
