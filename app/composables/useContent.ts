import type { ProjectsCollectionItem } from '@nuxt/content'

// One place for content queries, so pages share cache keys and the same filtering rules.

export function useProfile() {
  return useAsyncData('profile', () => queryCollection('profile').first())
}

export function useExperience() {
  return useAsyncData('experience', async () => {
    const entries = await queryCollection('experience').order('order', 'ASC').all()
    return entries.filter((entry) => !entry.draft)
  })
}

export function useEducation() {
  return useAsyncData('education', () => queryCollection('education').order('order', 'ASC').all())
}

export function useSkills() {
  return useAsyncData('skills', async () => (await queryCollection('skills').first())?.groups ?? [])
}

/* What lists, cards and the board show. Leaving out each project's write-up keeps it out of
   every page's payload: the case study page queries its own project in full */
const PROJECT_SUMMARY = ['id', 'path', 'title', 'tagline', 'period', 'status', 'featured', 'stack', 'metrics', 'visual', 'order'] as const

export type ProjectSummary = Pick<ProjectsCollectionItem, (typeof PROJECT_SUMMARY)[number]>

export function useProjects() {
  return useAsyncData('projects', () =>
    queryCollection('projects')
      .select(...PROJECT_SUMMARY)
      .order('order', 'ASC')
      .all(),
  )
}

/* Profile is needed by every page and is always present, so callers get a plain ref */
export async function useRequiredProfile() {
  const { data } = await useProfile()
  if (!data.value) throw createError({ statusCode: 500, statusMessage: 'content/profile.yml is missing' })
  return data as Ref<NonNullable<typeof data.value>>
}
