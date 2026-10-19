# benduffaut.com

My portfolio and resume site. It's Nuxt 4 (Vue 3), every page is prerendered, and it runs in Docker on a laptop server at home, reached through a Cloudflare Tunnel.

- **Content is data.** Experience, projects, skills and the about text live in [`content/`](content) as YAML and Markdown, checked against schemas at build time.
- **One source for the resume.** `/resume` is built from the same content, and the build prints it to `/resume.pdf`, so the site and the PDF can't drift apart.
- **Push to deploy.** GitHub Actions lints, type checks and tests every push, then publishes an image the home server pulls automatically.

## Run it locally

You need [Node.js 24](https://nodejs.org) (`nvm use` picks it up from `.nvmrc`).

```sh
npm install
npm run dev          # http://localhost:3000
```

Content and code changes hot-reload. The contact form logs messages to the terminal until SMTP is set up in `.env` (copy `.env.example`).

To check the production build, including the resume PDF and the social preview image:

```sh
npm run build
npx playwright install chromium   # once
npm run assets                    # renders .output/generated/resume.pdf and og.png
npm run preview                   # http://localhost:3000
```

## Scripts

| Command            | What it does                                           |
| ------------------ | ------------------------------------------------------ |
| `npm run dev`      | Dev server with hot reload                             |
| `npm run build`    | Production build, every page prerendered to `.output/` |
| `npm run assets`   | Render `resume.pdf` and `og.png` from the build        |
| `npm run preview`  | Run the production build                               |
| `npm run check`    | Lint, format check, type check and unit tests          |
| `npm run test:e2e` | Browser and accessibility tests against the build      |
| `npm run lint:fix` | Fix lint issues and format everything                  |

## Layout

```
content/          all site copy: profile, experience, education, skills, projects
content.config.ts schemas for the content
app/
  assets/css/     design tokens and shared styles (Tailwind v4)
  components/     home/ sections, project/ cards and animated visuals, ui/ primitives
  pages/          /, /projects, /projects/[slug], /resume, /og
server/           contact API, health check, sitemap, generated asset routes
shared/           code used by both the browser and the server (contact validation)
scripts/          render-assets.mjs (resume PDF and preview image)
tests/            unit/ (Vitest) and e2e/ (Playwright + axe)
deploy/           auto-update script and systemd timer for the home server
Dockerfile        build → render assets → small runtime image
compose.yaml      site, Cloudflare Tunnel, Umami analytics
```

## Docs

- [Editing content](docs/content.md): add a project, update experience, keep the resume to one page
- [Architecture](docs/architecture.md): how it's built and why, and how to extend it
- [Deployment](docs/deployment.md): GitHub, the home server, the tunnel, email, analytics

## Before launch

- [ ] Fill in the UF Pathology dates in `content/experience/uf-pathology.yml` and remove `draft: true`
- [ ] Set up the server, tunnel, email routing and SMTP: [docs/deployment.md](docs/deployment.md)
- [ ] Record the TennisTracker demo and set `video:` in `content/projects/02.tennistracker.md`
- [ ] Add `benduffaut.com` as the website on your GitHub profile
