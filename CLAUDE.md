# benduffaut.com

Ben's portfolio site: Nuxt 4 + Vue 3 + Tailwind v4 + Nuxt Content, prerendered, Dockerized, served from a home server via Cloudflare Tunnel. Start with README.md, then docs/.

## Rules

- **Never push, open PRs, or otherwise write to GitHub.** Ben does that himself. Committing locally is fine only when asked.
- The repo is public. Never commit `notes/`, `Ben_Resume.pdf`, `.env`, or anything with his phone number. That includes `public/resume.pdf`: it must be Ben's export without the phone.
- Site copy belongs in `content/`, never hard-coded in components. Schemas are in `content.config.ts`.
- Components are styled only with design tokens (`app/assets/css/main.css` and `tokens.css`): no raw hex, `rgb()` or font names in components. That's what lets every theme restyle them. Raw values belong in `app/assets/css/themes/*.css`. Adding a theme: docs/architecture.md#adding-a-theme.
- Every animation must respect `prefers-reduced-motion` and show a sensible static state.
- Looping animations use opacity and transforms only, so they stay on the compositor. Measure performance on the production build, never `npm run dev`. See docs/architecture.md#performance.

## Commands

```sh
npm run dev                          # dev server
npm run check                        # lint, format, types, unit tests
npm run build && npm run assets      # production build + og.png
npm run test:e2e                     # Playwright + axe against the build
```

Run `npm run check` and `npm run test:e2e` before calling a change done. The e2e suite includes WCAG AA checks, so new text colors must pass contrast.
