import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Unit tests for plain TypeScript (shared/ and server/utils/). Browser behavior is
// covered by Playwright in tests/e2e against the built site.
export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
