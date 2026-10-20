import { DEFAULT_THEME, isThemeId } from '~/themes'

// The head script in app.vue has already put the visitor's saved theme on <html>. Copy it into
// the app's state before hydration, so components and the theme menu agree with the page.
export default defineNuxtPlugin(() => {
  const current = document.documentElement.dataset.theme
  useState('theme').value = isThemeId(current) ? current : DEFAULT_THEME
  syncThemeColor()
})
