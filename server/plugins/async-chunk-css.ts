// With features.inlineStyles, every style the server-rendered page needs is inlined into the
// HTML. Nuxt still links the CSS of shared page chunks, which repeats those styles and adds
// the few for things that only appear after interaction (the board's edit mode). A stylesheet
// link blocks the first paint, so these load without blocking instead: as print-only, switched
// to all media once loaded. Nothing on the first screen depends on them.

const CHUNK_CSS = /<link rel="stylesheet" href="(\/_nuxt\/[^"]+\.css)"([^>]*)>/g

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head = html.head.map((chunk) =>
      chunk.replace(
        CHUNK_CSS,
        (_tag, href: string, rest: string) => `<link rel="stylesheet" href="${href}"${rest} media="print" onload="this.media='all'">`,
      ),
    )
  })
})
