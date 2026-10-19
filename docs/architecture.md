# Architecture

## Overview

```
 content/*.yml, *.md ──► Nuxt build ──► prerendered HTML + JSON payloads ─┐
                                                                          ├─► Docker image ─► GHCR
 /og page ──► Playwright ──► og.png ──────────────────────────────────────┘
                                                                                   │ pulled every 2 min
 visitor ─► Cloudflare (TLS, CDN) ─► Tunnel ─► cloudflared ─► site container ◄─────┘
                                                               │  /api/contact ─► SMTP (Gmail)
                                                               └─ /stats/* ─► Umami ─► Postgres
```

## Decisions

**Nuxt 4, prerendered, served by a Node server.** Every page is rendered to HTML at build time, so it's fast, readable by search engines and link previews, and has almost nothing that can break at runtime. A small Node server (Nitro) serves those files plus the few dynamic routes: the contact form, the health check, the generated assets and the analytics proxy. A purely static site would need a third-party form service. A fully server-rendered site would do work on every request for content that only changes on deploy.

**Content collections, not components, hold the copy.** `content.config.ts` defines a schema for each kind of content. Pages query collections (`app/composables/useContent.ts`), so adding a project or a job is a content change, never a code change. A blog will be another collection.

**The resume is my own PDF.** It's typeset in LaTeX and saved as `public/resume.pdf`, served as a static file. `/resume` shows it in an `<object>`, with a download fallback for browsers that can't display PDFs inline (most phones). It isn't generated from `content/`, so updating the resume means replacing the file.

**The social preview is rendered from the build.** `scripts/render-assets.mjs` starts the built server and screenshots `/og` with Chromium. The image depends on the build, so it's written to `.output/generated` and served by `server/routes/og.png.get.ts`, rather than living in `public/`.

**Tailwind v4 with the design tokens in CSS.** All colors, fonts and easings are declared once in `@theme` in `app/assets/css/main.css`, which makes them CSS variables and Tailwind utilities at the same time (`bg-surface`, `text-faint`, `var(--color-accent)`). Larger patterns (panels, buttons, chips, prose) are component classes in the same file.

**Motion is CSS first.** Animations are CSS keyframes and transitions. Two directives in `app/plugins/directives.ts` add behavior: `v-reveal` fades content in on scroll, and `v-spotlight` makes panel borders follow the pointer. Everything respects `prefers-reduced-motion`, and content is never hidden if JavaScript fails.

**The home page's projects section is a live board on my own library.** `app/components/home/HomeProjects.vue` renders a `DashboardGrid` from [`custom-dashboard-grid`](https://www.npmjs.com/package/custom-dashboard-grid) (0.2), set up like the library's Sentinel demo. It server-renders like everything else, so the projects are in the HTML.

- **Widgets** (`app/components/board/`):
  - `BoardProjectWidget` is one project
  - `BoardStatWidget` is a KPI tile for one number from a project's `metrics`
  - `BoardFrame` is the shared chrome ported from the demo's `WidgetCard`: header, collapse, pin menu, remove, and a live position readout. In view mode the body links to the project; in edit mode it doesn't
- **Sizes vary on purpose.** The default board is hand-placed in `shared/utils/projectLayout.ts`, along with which metrics get stat tiles. Projects added later in `content/` are placed automatically. Each widget shows more as it grows, using container queries in `BoardProjectWidget`: tagline at its smallest, then the visual, the stack, then metrics. Wide and short puts the visual beside the text
- **Edit mode** (Customize) shows:
  - `BoardDock`: undo, redo, auto-arrange, reset, and a trash zone via `v-widget-trash`
  - `BoardTray`: removed widgets, which visitors drag back in with `v-draggable-widget`
  - selection and the cell lattice. Snap guides are off on purpose
- **Breakpoints:** the full 12 columns down to a 700px board, then one column in reading order
- **Saving:** the library's `useLayoutStorage` with `loadOnMount` and `reconcileLayout`. A storage adapter only writes after the visitor's first `source: 'user'` change, so people who never touch the board always get the current default. Removed widget ids are stored separately, so they stay removed while new projects still appear. The keys are `benduffaut:project-board` and `...:removed`. Bump `PROJECT_LAYOUT_VERSION` if the widget format changes
- **Arrival:** the board stays hidden until it scrolls into view, then plays the grid's `zip` cascade
- **Workaround for 0.2.0** ([issue #2](https://github.com/bduffaut/Custom-Dashboard/issues/2)): the server renders placeholder widths, so the grid's transitions stay off until it has measured. Remove it once that's fixed. Widgets use fixed sizes rather than `sizeToContent`, so [issue #1](https://github.com/bduffaut/Custom-Dashboard/issues/1) doesn't affect the board

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

### Adding a full grid playground

The project grid only shows project cards. For a page with the whole widget catalog, like the Sentinel demo: create `app/pages/playground.vue`, port widgets from the library's `playground/src/widgets`, and reuse the `--dg-*` tokens already in `main.css`.

### Adding a project visual

Create `app/components/project/visual/Name.vue`, register it in `ProjectVisual.vue`, and add its key to the `visual` enum in `content.config.ts`.
