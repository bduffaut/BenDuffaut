# Architecture

## Overview

```
 content/*.yml, *.md ──► Nuxt build ──► prerendered HTML + JSON payloads ─┐
                                                                          ├─► Docker image ─► GHCR
 /resume, /og pages ──► Playwright ──► resume.pdf, og.png ────────────────┘
                                                                                   │ pulled every 2 min
 visitor ─► Cloudflare (TLS, CDN) ─► Tunnel ─► cloudflared ─► site container ◄─────┘
                                                               │  /api/contact ─► SMTP (Gmail)
                                                               └─ /stats/* ─► Umami ─► Postgres
```

## Decisions

**Nuxt 4, prerendered, served by a Node server.** Every page is rendered to HTML at build time, so it's fast, readable by search engines and link previews, and has almost nothing that can break at runtime. A small Node server (Nitro) serves those files plus the few dynamic routes: the contact form, the health check, the generated assets and the analytics proxy. A purely static site would need a third-party form service. A fully server-rendered site would do work on every request for content that only changes on deploy.

**Content collections, not components, hold the copy.** `content.config.ts` defines a schema for each kind of content. Pages query collections (`app/composables/useContent.ts`), so adding a project or a job is a content change, never a code change. A blog will be another collection.

**The resume is a page.** `/resume` renders from the same collections, filtered by `resume: true`. `scripts/render-assets.mjs` starts the built server, prints `/resume` to PDF with Chromium, and screenshots `/og` for the social preview. Those files depend on the build, so they're written to `.output/generated` and served by routes in `server/routes`, rather than living in `public/`.

**Tailwind v4 with the design tokens in CSS.** All colors, fonts and easings are declared once in `@theme` in `app/assets/css/main.css`, which makes them CSS variables and Tailwind utilities at the same time (`bg-surface`, `text-faint`, `var(--color-accent)`). Larger patterns (panels, buttons, chips, prose) are component classes in the same file.

**Motion is CSS first.** Animations are CSS keyframes and transitions. Two directives in `app/plugins/directives.ts` add behavior: `v-reveal` fades content in on scroll, and `v-spotlight` makes panel borders follow the pointer. Everything respects `prefers-reduced-motion`, and content is never hidden if JavaScript fails.

**No client state library.** There's no app state beyond the contact form. If that changes, Pinia is the Nuxt-native choice.

## Design system

From the Sentinel demo of `custom-dashboard-grid`:

- Surfaces: `bg` → `surface` → `surface-2` → `surface-3`, with `border` and `border-strong`
- Text: `text`, `muted`, `faint`. `faint` is the lightest that still passes WCAG AA on surfaces
- Accent teal for interface chrome, cyan for data and numbers, indigo only at the end of gradients
- Chakra Petch for display, IBM Plex Sans for reading, IBM Plex Mono for labels and data, all self-hosted via Fontsource
- `.panel`: one chamfered corner, a pointer-tracking gradient border and an inner glow
- `.btn--primary`: a rotating conic-gradient edge that floods with the gradient on hover

## Security

- The container runs as a non-root user on a read-only filesystem, with no new privileges and a memory cap
- No ports are open on the router. The tunnel is outbound only and Cloudflare terminates TLS
- Secrets are runtime env vars only. They're never build args, so they never enter the image
- The contact form validates on the server with the same rules as the browser and strips control characters (no header injection). It rate limits 5 messages per hour per IP, quietly drops honeypot and too-fast submissions, and can add Cloudflare Turnstile
- `www` and other host variants redirect to the canonical URL (`server/plugins/canonical-host.ts`)

## Testing

- `tests/unit`: Vitest for plain logic (contact validation, rate limiting)
- `tests/e2e`: Playwright against the production build on desktop and mobile. It covers page rendering, axe accessibility checks (WCAG 2.1 AA), navigation, form validation, redirects and the API
- CI runs all of it on every push and pull request, and only publishes an image if everything passes

## Extending

### Adding a blog

1. Add a `posts` collection in `content.config.ts` (`type: 'page'`, `source: 'blog/*.md'`, with `title`, `date` and `description`)
2. Add `app/pages/blog/index.vue` and `app/pages/blog/[slug].vue`, modeled on the project pages
3. Add `/blog` to the header nav and the sitemap route

Prerendering picks the new pages up automatically.

### Adding the live grid demo

Once `custom-dashboard-grid` is on npm:

1. `npm install custom-dashboard-grid`
2. Create `app/pages/playground.vue` that imports `DashboardGrid` and its stylesheet. The grid measures the DOM, so wrap it in `<ClientOnly>`
3. Map the grid's theming hooks (`--dg-*`) to this site's tokens. The Sentinel playground's `style.css` already has the right values
4. Link it from the Custom Dashboard Grid project, and add the npm link to that project's `links`

### Adding a project visual

Create `app/components/project/visual/Name.vue`, register it in `ProjectVisual.vue`, and add its key to the `visual` enum in `content.config.ts`.
