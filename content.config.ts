import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// All site copy lives in content/. Each collection below is schema checked at
// build time, so a typo in a content file fails the build instead of the page.
// docs/content.md explains how to add or edit entries.

const link = z.object({
  label: z.string(),
  href: z.string(),
})

export default defineContentConfig({
  collections: {
    profile: defineCollection({
      type: 'data',
      source: 'profile.yml',
      schema: z.object({
        name: z.string(),
        shortName: z.string(),
        role: z.string(),
        headline: z.string(),
        summary: z.string(),
        location: z.string(),
        email: z.string(),
        availability: z.object({
          open: z.boolean(),
          label: z.string(),
        }),
        links: z.object({
          github: z.string(),
          linkedin: z.string(),
          repo: z.string(),
        }),
        about: z.array(z.string()),
        beyond: z.array(
          z.object({
            title: z.string(),
            meta: z.string(),
            body: z.string(),
            /* Big outlined figure behind the card, e.g. "12th" */
            stat: z.string().optional(),
          }),
        ),
      }),
    }),

    experience: defineCollection({
      type: 'data',
      source: 'experience/*.yml',
      schema: z.object({
        order: z.number(),
        role: z.string(),
        company: z.string(),
        location: z.string(),
        start: z.string(),
        end: z.string(),
        kind: z.enum(['work', 'research']),
        summary: z.string().optional(),
        highlights: z.array(z.string()),
        stack: z.array(z.string()).default([]),
        /* Hidden everywhere until it's ready, e.g. missing dates */
        draft: z.boolean().default(false),
      }),
    }),

    education: defineCollection({
      type: 'data',
      source: 'education/*.yml',
      schema: z.object({
        order: z.number(),
        school: z.string(),
        degree: z.string(),
        detail: z.string().optional(),
        location: z.string(),
        start: z.string(),
        end: z.string(),
        coursework: z.array(z.string()).default([]),
      }),
    }),

    skills: defineCollection({
      type: 'data',
      source: 'skills.yml',
      schema: z.object({
        groups: z.array(
          z.object({
            name: z.string(),
            items: z.array(z.string()),
          }),
        ),
      }),
    }),

    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        order: z.number(),
        tagline: z.string(),
        period: z.string(),
        status: z.enum(['shipped', 'in-progress', 'archived']).default('shipped'),
        featured: z.boolean().default(false),
        role: z.string(),
        team: z.string().optional(),
        stack: z.array(z.string()),
        metrics: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          )
          .default([]),
        links: z.array(link).default([]),
        /* Which visual the card and case study header use, see components/project/ProjectVisual.vue */
        visual: z.enum(['grid', 'tennis', 'news', 'mutation', 'components', 'site', 'none']).default('none'),
        /* Path under public/ of a demo video. Leave empty to show a placeholder. */
        video: z.string().optional(),
      }),
    }),
  },
})
