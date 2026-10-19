import type { InjectionKey, Ref } from 'vue'
import type { ProjectsCollectionItem } from '@nuxt/content'

// The project grid provides its projects by slug, so each widget only stores a slug in
// the saved layout and looks the content up here
export const PROJECTS_BY_SLUG: InjectionKey<Ref<Map<string, ProjectsCollectionItem>>> = Symbol('projects-by-slug')
