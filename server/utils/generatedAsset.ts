import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { H3Event } from 'h3'

// Serves files rendered after the build by scripts/render-assets.mjs (the social preview
// image). They're made from the built site, so they can't sit in public/ at build time.
// In the Docker image they live in /app/.output/generated.

export async function sendGeneratedAsset(event: H3Event, name: string, type: string) {
  const dir = process.env.GENERATED_ASSETS_DIR || resolve(process.cwd(), '.output/generated')
  const path = resolve(dir, name)
  const info = await stat(path).catch(() => null)
  if (!info) throw createError({ statusCode: 404, statusMessage: `${name} hasn't been generated. Run npm run assets after a build.` })

  setResponseHeaders(event, {
    'content-type': type,
    'content-length': info.size,
    'cache-control': 'public, max-age=3600',
    'last-modified': info.mtime.toUTCString(),
  })
  return sendStream(event, createReadStream(path))
}
