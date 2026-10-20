// The site's themes. Content and components are the same in every theme; a theme only
// changes how they look. Each one is:
//   - an entry here: its name in the theme menu, and which of the scripted effects it uses
//   - app/assets/css/themes/<id>.css: its token values and any styling only it has
//
// To add a theme, add both and import the CSS file in main.css. docs/architecture.md has
// the full checklist. The e2e tests run the accessibility checks against every theme here.

import type { BackdropId } from '../backdrops'

export interface Theme {
  id: string
  label: string
  /* One line under the name in the theme menu */
  description: string
  /* Three colors for the menu's preview: background, accent, data. Keep in step with the CSS */
  swatch: [bg: string, accent: string, data: string]
  /* Scripted effects, which CSS can't switch on its own */
  effects: {
    /* The animated backdrop behind every page that reacts to the pointer (app/backdrops/) */
    backdrop: BackdropId | null
    /* Headings that decode from random glyphs on load (components/ui/ScrambleText.vue) */
    scramble: boolean
  }
}

export const THEMES = [
  {
    id: 'signal',
    label: 'Signal',
    description: 'Dark ops console with a live grid',
    swatch: ['#0a0e14', '#2dd4bf', '#22d3ee'],
    effects: { backdrop: 'lattice', scramble: true },
  },
  {
    id: 'mustafar',
    label: 'Mustafar',
    description: 'Lava world, embers and a lit saber',
    swatch: ['#0b0605', '#ff7a2e', '#e0262b'],
    effects: { backdrop: 'mustafar', scramble: false },
  },
  {
    id: 'elements',
    label: 'Elements',
    description: 'Water, earth, fire and air, in ink',
    swatch: ['#ead9b5', '#9e2016', '#1b5794'],
    effects: { backdrop: 'elements', scramble: false },
  },
  {
    id: 'grove',
    label: 'Grove',
    description: 'Dusk in the trees, with fireflies',
    swatch: ['#0c1510', '#93cf73', '#e8d982'],
    effects: { backdrop: 'grove', scramble: false },
  },
] as const satisfies readonly Theme[]

export type ThemeId = (typeof THEMES)[number]['id']

/* What everyone sees until they pick another. Also used for the social preview image */
export const DEFAULT_THEME: ThemeId = 'signal'

/* Show the theme menu in the header. Turn off to ship just DEFAULT_THEME */
export const THEME_MENU = true

/* Where a visitor's choice is kept, in their browser only */
export const THEME_STORAGE_KEY = 'benduffaut:theme'

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value)
}
