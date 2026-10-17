// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

// Nuxt's recommended rules. Formatting is left to Prettier.
export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
    // Prettier owns formatting, including how void elements are written
    'vue/html-self-closing': 'off',
  },
})
