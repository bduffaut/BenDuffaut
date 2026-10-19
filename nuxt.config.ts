import tailwindcss from '@tailwindcss/vite'

// Every page is prerendered to static HTML at build time. The Node server that
// ships in the Docker image serves those files and the few dynamic routes
// (/api/contact, /healthz, the analytics proxy). See docs/architecture.md.

const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://benduffaut.com').replace(/\/$/, '')

// Optional self-hosted Umami. The tracker is proxied through this site under /stats
// so it isn't blocked as third party and Umami needs no public hostname of its own.
const umamiUrl = process.env.UMAMI_URL || 'http://umami:3000'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  modules: ['@nuxt/content', '@nuxt/eslint'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0a0e14' },
        { name: 'color-scheme', content: 'dark' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  // Public values are baked into the prerendered HTML, so they are build-time
  // settings (Docker build args), not container env vars.
  runtimeConfig: {
    contact: {
      to: '',
      from: '',
      smtpHost: '',
      smtpPort: 465,
      smtpSecure: true,
      smtpUser: '',
      smtpPass: '',
      turnstileSecret: '',
    },
    public: {
      siteUrl,
      buildSha: process.env.NUXT_PUBLIC_BUILD_SHA || 'dev',
      umamiWebsiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || '',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    },
  },

  content: {
    experimental: {
      // node:sqlite ships with Node 22.5+, so no native module to compile in Docker
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        highlight: false,
      },
    },
  },

  routeRules: {
    '/api/**': { prerender: false, headers: { 'cache-control': 'no-store' } },
    // Rendered after the build by scripts/render-assets.mjs, served by server/routes
    '/og.png': { prerender: false },
    '/stats/script.js': { proxy: `${umamiUrl}/script.js` },
    '/stats/api/send': { proxy: `${umamiUrl}/api/send` },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  nitro: {
    preset: 'node-server',
    compressPublicAssets: { gzip: true, brotli: true },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/resume', '/og', '/sitemap.xml', '/404.html'],
      failOnError: true,
    },
  },

  typescript: {
    strict: true,
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },
})
