// One canonical address. Requests for www.benduffaut.com get a permanent redirect to the
// site URL with the path and query kept. This runs as a request hook rather than
// middleware because prerendered pages are served before middleware would see them.
// Local and internal requests (localhost, IPs, the Docker network) are left alone.

export default defineNitroPlugin((nitroApp) => {
  const canonical = new URL(useRuntimeConfig().public.siteUrl)

  nitroApp.hooks.hook('request', async (event) => {
    const host = getRequestHost(event, { xForwardedHost: true }).split(':')[0]?.toLowerCase()
    if (!host || host === canonical.hostname) return

    // Only www and bare variants of our own host, so a misrouted request doesn't bounce elsewhere
    if (host !== `www.${canonical.hostname}` && `www.${host}` !== canonical.hostname) return

    await sendRedirect(event, `${canonical.origin}${event.path}`, 301)
  })
})
