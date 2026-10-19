import { resolve } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

// Runs against the production build, so build first: npm run build && npm run test:e2e
const PORT = 4320

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node .output/server/index.mjs',
    url: `http://127.0.0.1:${PORT}/healthz`,
    env: {
      PORT: String(PORT),
      HOST: '127.0.0.1',
      // An absolute path, like the Docker image uses. Nuxt Content's default breaks when the
      // project path has a space in it (it keeps the %20)
      NUXT_CONTENT_DATABASE_FILENAME: resolve('.data/e2e/contents.sqlite'),
    },
    reuseExistingServer: !process.env.CI,
  },
})
