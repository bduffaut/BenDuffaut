// Renders a file that's made from the built site itself:
//   /og.png  the /og page screenshotted at 1200×630, used as every page's og:image
// (The resume is a hand-made PDF in public/, not rendered here.)
//
// Usage: npm run build && npm run assets
// It starts the built server on a spare port, renders with Playwright's Chromium, writes
// into .output/generated (served by server/routes), then stops the server.
// In Docker this runs in its own build stage, see Dockerfile.

import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const PORT = Number(process.env.ASSETS_PORT || 4310)
const ORIGIN = `http://127.0.0.1:${PORT}`
const OUT = process.env.GENERATED_ASSETS_DIR || resolve('.output/generated')

const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', NODE_ENV: 'production' },
  stdio: ['ignore', 'inherit', 'inherit'],
})

try {
  await waitForServer()
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()

    await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 1200, height: 630 })
    await page.goto(`${ORIGIN}/og`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: resolve(OUT, 'og.png'), clip: { x: 0, y: 0, width: 1200, height: 630 } })
    console.log('[assets] wrote og.png')
  } finally {
    await browser.close()
  }
} finally {
  server.kill()
}

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`${ORIGIN}/healthz`)
      if (res.ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Server didn't start on ${ORIGIN}`)
}
