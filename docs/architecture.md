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

**Themes are token sets, not component variants.** Every component is styled only with design tokens (`var(--color-accent)`, `bg-surface`, `--radius`...), never raw values. A theme supplies values for those tokens plus a few touches only it has, so the content and the components are shared by every theme and a new look never means new components. The visitor picks one from the palette menu in the header; see [Design system](#design-system).

**Tailwind v4 with the design tokens in CSS.** Color and font tokens are declared once in `@theme` in `app/assets/css/main.css`, which makes them CSS variables and Tailwind utilities at the same time (`bg-surface`, `text-faint`, `font-meta`). Shape, type and light tokens that aren't utilities are in `tokens.css`. Larger patterns (panels, buttons, chips, prose) are component classes in `components.css`.

**Motion is CSS first.** Animations are CSS keyframes and transitions. Two directives in `app/plugins/directives.ts` add behavior: `v-reveal` fades content in on scroll, and `v-spotlight` makes panel borders follow the pointer. Everything respects `prefers-reduced-motion`, and content is never hidden if JavaScript fails.

**Each theme has a live backdrop.** `app/components/site/SiteField.vue` is a canvas inside the fixed `.backdrop` that runs the theme's `effects.backdrop` from `app/backdrops/`. `runner.ts` owns the plumbing (pixel density, pointer, frame loop, cleanup) and each effect only draws. Every one reacts to plain hovering, not just clicks:

- Signal's **lattice**: grid points come up as + marks near the mouse; clicks ripple
- Mustafar's **mustafar**: embers rising and ash falling in three depths (faint far specks, sharp mid-field sparks with motion streaks, big out-of-focus ones near the lens), under lava light breathing up from beyond the horizon. Hovering is a heat source: a faint warmth follows the cursor, embers spiral up around it and ash lifts away. Clicks throw thin sparks
- Elements' **elements**: wind lines with curled heads and tumbling leaves drift across the scroll. Hovering calls four element orbs (water, earth, fire, air) that circle the cursor on springs, swinging out behind it as it moves, trailing tapered ribbons of their color. Each click bends the next element: a water splash, a spray of rock, a plume of fire, an air spiral
- Grove's **grove**: fireflies that swirl around the cursor and light up under a soft lantern glow, and scatter on click. Grass of damped springs that parts around the cursor, is brushed along by it and carries waves outward

`runner.ts` also keeps them smooth: frames run at the display's own rate and only drop to half when a device can't keep up, motion is driven by elapsed time so it's the same speed at any rate, effects follow an eased copy of the pointer so they never jitter with individual mouse events, and the canvas renders at no more than 1.5x pixel density. Signal's sleeps when nothing is happening; the other three are ambient. None run with reduced motion, where the theme's static CSS backdrop stays. The `body` has no background of its own on purpose: it would paint over the backdrop.

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
- **Breakpoints** (`BOARD_BREAKPOINTS`): the full 12 columns down to a 700px board, then a hand-placed 6-column phone board (`PHONE_PLACEMENT`, stored on each widget as `breakpoints.phone`) with stat tiles and two projects side by side, so it still reads as a dashboard
- **Touch screens:** `v-spotlight` swaps the pointer for a line across the middle of the screen, so panel edges light up as they scroll past and the crossing panel gets `data-lit` (styled like `:hover`). Hover effects only apply with `(hover: hover)`, and taps get `:active` press states instead
- **Saving:** the library's `useLayoutStorage` with `loadOnMount` and `reconcileLayout`. A storage adapter only writes after the visitor's first `source: 'user'` change, so people who never touch the board always get the current default. Removed widget ids are stored separately, so they stay removed while new projects still appear. The keys are `benduffaut:project-board` and `...:removed`. Bump `PROJECT_LAYOUT_VERSION` if the widget format changes
- **Arrival:** the board stays hidden until it scrolls into view, then plays the grid's `zip` cascade
- **Workaround for 0.2.0** ([issue #2](https://github.com/bduffaut/Custom-Dashboard/issues/2)): the server renders placeholder widths, so the grid's transitions stay off until it has measured. Remove it once that's fixed. Widgets use fixed sizes rather than `sizeToContent`, so [issue #1](https://github.com/bduffaut/Custom-Dashboard/issues/1) doesn't affect the board

**No client state library.** There's no app state beyond the contact form. If that changes, Pinia is the Nuxt-native choice.

## Design system

### Files

| File                                | What's in it                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `app/themes/index.ts`               | The theme registry: names, menu swatches, scripted effects, `DEFAULT_THEME`, `THEME_MENU`         |
| `app/assets/css/main.css`           | `@theme` color and font tokens (Signal's values are the defaults), base styles, the backdrop      |
| `app/assets/css/tokens.css`         | Shape, type and light tokens, mostly derived from the colors                                      |
| `app/assets/css/components.css`     | `.panel`, `.btn`, `.chip`, `.field`, `.eyebrow`, `.prose-site`                                    |
| `app/assets/css/themes/<id>.css`    | One per theme: token values, then anything only that theme does                                   |
| `app/composables/useTheme.ts`       | The active theme, `setTheme()`, and the head script that applies a saved theme before first paint |
| `app/components/site/ThemeMenu.vue` | The palette menu in the header                                                                    |

### The token contract

- **Surfaces:** `bg` → `surface` → `surface-2` → `surface-3`, `bg-deep` for recessed wells and fields, `border` and `border-strong`
- **Text:** `text`, `muted`, `faint`. `faint` must still pass WCAG AA on `bg`, `surface` and `surface-2`
- **Color roles:** `accent` for interface chrome, `data` for numbers and highlights, `accent-alt` only at the end of gradients, `on-accent` for text on an accent fill, plus `good`, `warning`, `danger` and `shadow`. Names say what a color is for, never what it looks like
- **Fonts:** `display` for headings, `sans` for reading, `meta` for dates and small labels, `code` for code
- **Shape:** `--clip: none` turns off the chamfered corners; `--radius`, `--radius-control`, `--radius-sm`; `--panel-shadow` and `--shadow-lift`
- **Type details:** heading weight, tracking and width; the label font, size, case and tracking; `--prose-marker`
- **Light:** `--accent-glow` and `--data-glow` (transparent turns glows off), `--spotlight` and `--spotlight-wash` for the pointer light on panels, `--gradient-brand`, and the backdrop: `--backdrop`, `--backdrop-grid`, `--grain`

### Themes

- **Signal** (default): the original, from the Sentinel demo of `custom-dashboard-grid`. Near-black, teal and cyan, one chamfered corner per panel, a rotating gradient edge on primary buttons, the live lattice and the scramble-in name. Chakra Petch, IBM Plex Sans and Mono
- **Mustafar:** a lava world, after the volcanic planet in _Revenge of the Sith_, shot like film and kept restrained. Smoke and basalt, ash-white type, ember orange and one Sith red for the sabers, Barlow Condensed in wide-tracked capitals. The lava is never shown head on: a horizon of dark ridges is fixed along the bottom of the screen with its light behind them. The name is a title card (the first name small and spaced out in ember, the surname large in ash white, a saber igniting under it); panels are quiet dark slabs that sweep a molten line along their lower edge and warm the light beneath on hover; buttons ignite a saber along their edge; section rules are sabers that light as they scroll in; the experience rail is a hairline with breathing ember nodes; skills are slabs with their name down the side; ridges stand over the footer
- **Elements:** water, earth, fire and air in ink on an old scroll, after the original animated series. Hand-lettered Macondo headings over Alegreya. Each section belongs to an element that sets its color and emblem: Experience is water (a flowing stream, water-drop nodes), Projects earth, About air, Beyond fire, and Skills and Contact use all four. The hero is a centered title card under a turning ring of the four emblems, with the readout hung as a scroll on wooden rods. Panels are framed scrolls with their element's emblem as a watermark and an element bar on hover; headings get a brush-stroke underline painted on as they appear; the primary button is a red seal that stamps down on hover; ink-wash mountains stand over the footer. The emblems are original designs, not the show's
- Ornament SVGs live in `public/themes/<id>/` and are used as CSS masks, so they take the theme's colors and only download for that theme
- **Grove:** the grove at dusk, kept like a naturalist's field journal. Forest greens, lichen text, fern green and firefly yellow. Soft Fraunces headings and italic field-guide labels, leaf-cornered cards, the hero readout hung as a specimen tag, a vine for the experience rail, skills in herbarium columns, journal-line form fields, a fern in the hero and a tree line over the footer. Ornament SVGs are in `public/themes/grove/` and are used as masks, so they only download for Grove

### Restyling beyond tokens

Components expose stable class hooks for themes to restyle structure, not just color: `hero`, `hero__name`, `readout`, `section-heading` (with `__index`, `__rule`, `__title`), `timeline`, `timeline__node`, `timeline__date`, `job`, `job__company`, `skill-group`, `education`, `about__text`, `beyond-card`, `contact-card`, `project-card`, `site-footer`. Target these rather than Tailwind utilities, and start the selector with `:root[data-theme='<id>']` so it outranks the components' scoped styles. `themes/grove.css`, `mustafar.css` and `elements.css` are worked examples; Elements also shows a theme giving each section its own colors through section-scoped variables.

### Adding a theme

1. Copy `app/assets/css/themes/elements.css` (light) or `grove.css` (dark) to `themes/<id>.css` and change the values. Anything a token can't express goes below the token block, scoped to `[data-theme='<id>']` and kept to the component classes
2. Import it at the top of `main.css`, and add its fonts to `fonts.css` (`npm install @fontsource-variable/<font>`)
3. Add an entry to `THEMES` in `app/themes/index.ts`, with swatch colors that match the CSS and a backdrop (reuse one, write one in `app/backdrops/` and list it in `index.ts`, or `null`)
4. `npm run check` catches a theme that's half added; `npm run test:e2e` runs the accessibility checks, contrast included, against the new theme

To ship a single theme, set `DEFAULT_THEME` and turn `THEME_MENU` off. The social preview image always uses `DEFAULT_THEME`.

## Security

- The container runs as a non-root user on a read-only filesystem, with no new privileges and a memory cap
- No ports are open on the router. The tunnel is outbound only and Cloudflare terminates TLS
- Secrets are runtime env vars only. They're never build args, so they never enter the image
- Every response carries baseline security headers (HSTS, `nosniff`, same-origin framing, referrer and permissions policies), set in `routeRules` in `nuxt.config.ts`
- The contact form validates on the server with the same rules as the browser and strips control characters (no header injection). It refuses bodies over 32 KB before reading them, rate limits 5 messages per hour per IP, quietly drops honeypot and too-fast submissions, and can add Cloudflare Turnstile. SMTP gives up after about 20 seconds so a stuck mail server can't hang the form
- `www` and other host variants redirect to the canonical URL (`server/plugins/canonical-host.ts`)

## Performance

Measure with Lighthouse against the production build (`npm run build`, then `npm run preview`), never the dev server, which ships unminified code and dev tooling. Use `--throttling-method=devtools` for real throttling: on localhost, the default simulated mode sees fonts finish before the first frame and wrongly models the first paint as waiting on them. With real throttling (slow 4G, a 4x slower CPU) the home page scores 98 to 99 on mobile, first paint and LCP at about 1.5 s, and 100 on desktop. What keeps it there:

- **No render-blocking CSS.** `features.inlineStyles` inlines the CSS into the prerendered HTML. The chunk stylesheets Nuxt still links (styles for things that only appear after interaction) load without blocking (`server/plugins/async-chunk-css.ts`)
- **Fonts.** Declared by hand in `fonts.css`, Latin files only, `font-display: swap`. The head script preloads only the active theme's two critical fonts (`app/themes/fonts.ts`)
- **The first screen paints at once.** The hero has no scroll reveal: hiding it until JavaScript ran cost over a second of LCP on phones
- **Lazy hydration.** Sections below the fold are server-rendered but hydrate as they scroll into view (`hydrate-on-visible` in `pages/index.vue`). Most also have `defer-render` (`content-visibility: auto`), so they aren't styled or laid out until they're near; never on anything with `position: fixed` descendants, like the project board
- **Small payloads.** List views query project summaries (`useProjects`), never the write-ups
- **Animations stay on the compositor.** Infinite animations use opacity and transforms, not box-shadows, filters, sizes or background positions. The project illustrations, which do animate layout, are contained (`contain: layout paint`) and pause off screen. Signal's spinning button edge spins only on hover
- **Caching.** Hashed assets are immutable for a year, theme ornaments cache for a week and the resume for a day

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
