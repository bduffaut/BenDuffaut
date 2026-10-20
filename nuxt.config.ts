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

  features: {
    // Inline the CSS into the prerendered HTML instead of linking it: a stylesheet blocks the
    // first paint until it arrives, and on a phone that round trip was most of the wait
    inlineStyles: true,
  },

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
        { name: 'color-scheme', content: 'dark light' },
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
    // Baseline security headers on everything. No script CSP: Nuxt's inline payload, the JSON-LD
    // and Turnstile would each need allowing, for little gain on a site with no user content.
    // Framing is limited to this site, which /resume needs for its PDF <object>.
    '/**': {
      headers: {
        'strict-transport-security': 'max-age=31536000',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'SAMEORIGIN',
        'content-security-policy': "frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
    '/api/**': { prerender: false, headers: { 'cache-control': 'no-store' } },
    // Rendered after the build by scripts/render-assets.mjs, served by server/routes
    '/og.png': { prerender: false },
    '/stats/script.js': { proxy: `${umamiUrl}/script.js` },
    '/stats/api/send': { proxy: `${umamiUrl}/api/send` },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    // Theme ornaments change rarely and aren't hashed: a week, then revalidate
    '/themes/**': { headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' } },
    '/favicon.svg': { headers: { 'cache-control': 'public, max-age=604800' } },
    // Replaced by hand now and then, so a shorter cache
    '/resume.pdf': { headers: { 'cache-control': 'public, max-age=86400' } },
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
