import type { ThemeId } from '.'

// Each theme's critical fonts: its headings and its reading face, the ones the first screen
// paints with. The head script preloads only the active theme's (composables/useTheme.ts), so
// the first paint doesn't wait to discover them and no one downloads another theme's fonts.
// The same files are declared in assets/css/fonts.css; Vite gives both the same hashed URL.

import chakra700 from '~~/node_modules/@fontsource/chakra-petch/files/chakra-petch-latin-700-normal.woff2?url'
import plexSans from '~~/node_modules/@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2?url'
import barlow700 from '~~/node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2?url'
import macondo from '~~/node_modules/@fontsource/macondo/files/macondo-latin-400-normal.woff2?url'
import alegreya from '~~/node_modules/@fontsource-variable/alegreya/files/alegreya-latin-wght-normal.woff2?url'
import fraunces from '~~/node_modules/@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2?url'

export const THEME_FONTS: Record<ThemeId, string[]> = {
  signal: [chakra700, plexSans],
  mustafar: [barlow700, plexSans],
  elements: [macondo, alegreya],
  grove: [fraunces, plexSans],
}
