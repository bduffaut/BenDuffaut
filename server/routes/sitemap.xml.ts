import { queryCollection } from '@nuxt/content/server'

// Prerendered at build time (nuxt.config.ts), so it always matches the content that shipped
export default defineEventHandler(async (event) => {
  const { siteUrl } = useRuntimeConfig().public
  const projects = await queryCollection(event, 'projects').select('path').all()

  const paths = ['/', '/projects', '/resume', ...projects.map((p) => p.path)]
  const urls = paths.map((path) => `  <url><loc>${siteUrl}${path === '/' ? '/' : path}</loc></url>`).join('\n')

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
