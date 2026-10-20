import { DEFAULT_THEME, THEMES, THEME_STORAGE_KEY, isThemeId, type ThemeId } from '~/themes'
import { THEME_FONTS } from '~/themes/fonts'

// The active theme. It lives on <html data-theme>, which every theme's CSS keys off.
//
// Pages are prerendered with DEFAULT_THEME. A visitor's saved choice is applied by an inline
// script in the <head> (app.vue) before the first paint, so there's no flash of the default,
// and plugins/theme.client.ts copies it into this state before the app hydrates.

export function useTheme() {
  const id = useState<ThemeId>('theme', () => DEFAULT_THEME)
  const theme = computed(() => THEMES.find((t) => t.id === id.value) ?? THEMES[0])

  function setTheme(next: ThemeId) {
    if (!isThemeId(next) || next === id.value) return
    const root = document.documentElement
    // Cross-fade colors for a moment (motion.css), then drop it so it doesn't slow hovers
    root.classList.add('theme-switching')
    setTimeout(() => root.classList.remove('theme-switching'), 400)

    id.value = next
    root.dataset.theme = next
    syncThemeColor()
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // storage blocked: the choice lasts until the page is closed
    }
  }

  return { theme, themes: THEMES, setTheme }
}

/* The browser chrome color on phones follows the theme's background */
export function syncThemeColor() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
  if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
}

/* Runs in the <head> before first paint: puts the saved theme on <html> and preloads that
   theme's critical fonts. Kept tiny and dependency free, it's inlined as a string */
export function themeBootScript(): string {
  const ids = JSON.stringify(THEMES.map((t) => t.id))
  return (
    `var t;try{t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}` +
    `if(${ids}.indexOf(t)<0)t=${JSON.stringify(DEFAULT_THEME)};` +
    `document.documentElement.setAttribute('data-theme',t);` +
    `(${JSON.stringify(THEME_FONTS)}[t]||[]).forEach(function(h){var l=document.createElement('link');l.rel='preload';l.as='font';l.type='font/woff2';l.crossOrigin='';l.href=h;document.head.appendChild(l)})`
  )
}
