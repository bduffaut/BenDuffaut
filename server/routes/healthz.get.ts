// Liveness check for the Docker healthcheck and uptime monitors
export default defineEventHandler((event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  return { ok: true, build: useRuntimeConfig().public.buildSha }
})
