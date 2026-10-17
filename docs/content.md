# Editing content

Everything the site says lives in `content/`. Schemas in `content.config.ts` check every file at build time, so a missing field or a typo fails the build with a clear message instead of breaking a page.

After editing, `npm run dev` shows the change immediately. Pushing to `main` deploys it.

## Files

| File               | What it controls                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `profile.yml`      | Name, headline, summary, email, links, availability, about text, "Beyond the code" cards |
| `experience/*.yml` | One file per job or research position                                                    |
| `education/*.yml`  | One file per school                                                                      |
| `skills.yml`       | Skill groups                                                                             |
| `projects/*.md`    | One file per project: front matter for the card, Markdown body for the case study        |

## Flags

| Field      | Where                           | Effect                                                                                                  |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `order`    | experience, education, projects | Sort order, lowest first                                                                                |
| `draft`    | experience                      | `true` hides the entry everywhere                                                                       |
| `resume`   | everything                      | Include on `/resume` and in the PDF. Projects default to `false`, the rest to `true`                    |
| `featured` | projects                        | Card on the home page and the top of `/projects`. Others go in "More projects"                          |
| `status`   | projects                        | `shipped`, `in-progress` or `archived` (shown as "Complete")                                            |
| `visual`   | projects                        | Which animated illustration to show: `grid`, `tennis`, `news`, `mutation`, `components`, `site`, `none` |
| `video`    | projects                        | Path to a demo video under `public/`, or `pending` to show "Demo video coming soon"                     |

## Adding a project

Create `content/projects/NN.slug.md`. The number only orders the files and is dropped from the URL, so `07.my-app.md` becomes `/projects/my-app`.

```md
---
title: My App
order: 7
featured: false
tagline: One sentence for the card.
period: Jan 2027 – Mar 2027
status: shipped
role: Solo
stack: [Vue 3, TypeScript]
links:
  - label: Source
    href: https://github.com/bduffaut/my-app
---

The case study, in Markdown. Use `## Headings` for sections.
```

Optional fields: `team`, `metrics` (value and label, shown as counters), `visual`, `video`, `resume` and `resumeHighlights`.

## Adding a demo video

Put an MP4 in `public/media/` (keep it under about 10 MB: 720p, H.264, no audio) and set `video: /media/name.mp4` in the project's front matter. It autoplays muted and loops in the case study header.

## Keeping the resume to one page

`npm run build && npm run assets` warns if the PDF runs past one page, and in CI that fails the build. To fit, shorten bullets or set `resume: false` on entries.

## Things to fill in

- `experience/uf-pathology.yml`: real dates, then delete `draft: true`
- `projects/02.tennistracker.md`: `video:` once the demo is recorded
- `projects/01.dashboard-grid.md`: add an npm link under `links` once it's published
