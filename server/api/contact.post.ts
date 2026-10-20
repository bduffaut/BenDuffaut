// Contact form endpoint. Validates with the same rules as the form, drops obvious bots
// quietly, rate limits per visitor, and emails the message with Reply-To set to the sender.

const limiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 })

/* Submissions faster than this after the form rendered are almost certainly bots */
const MIN_FILL_MS = 2500

/* A full form is under 6 KB. readBody buffers everything, so anything bigger is refused unread,
   or one large upload could run the 256 MB container out of memory */
const MAX_BODY_BYTES = 32 * 1024

export default defineEventHandler(async (event) => {
  // Behind Cloudflare Tunnel the visitor's address is in CF-Connecting-IP
  const ip = getHeader(event, 'cf-connecting-ip') || getRequestIP(event, { xForwardedFor: true }) || 'unknown'

  const { allowed, retryAfter } = limiter.hit(ip)
  if (!allowed) {
    setResponseHeader(event, 'retry-after', retryAfter)
    throw createError({ statusCode: 429, statusMessage: 'Too many messages. Please try again later, or email me directly.' })
  }

  // Browsers always send a length for a JSON body; without one the size can't be checked up front
  const length = Number(getHeader(event, 'content-length'))
  if (!length) throw createError({ statusCode: 411, statusMessage: 'Length required' })
  if (length > MAX_BODY_BYTES) throw createError({ statusCode: 413, statusMessage: 'Message too large' })

  const body = await readBody<Partial<ContactInput>>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Invalid request' })

  const result = validateContact(body)
  if (!result.ok)
    throw createError({ statusCode: 422, statusMessage: 'Please fix the highlighted fields', data: { errors: result.errors } })

  const message = result.value

  // Honeypot or impossibly fast: pretend it worked so bots learn nothing
  if (message.website || (message.startedAt && Date.now() - message.startedAt < MIN_FILL_MS)) {
    return { ok: true }
  }

  if (!(await verifyTurnstile(message.turnstileToken, ip))) {
    throw createError({ statusCode: 400, statusMessage: 'Bot check failed. Please refresh and try again.' })
  }

  if (!isMailerConfigured()) {
    if (import.meta.dev) {
      console.info('[contact] SMTP not configured, message not sent:', { ...message, message: `${message.message.slice(0, 80)}...` })
      return { ok: true }
    }
    console.error('[contact] SMTP is not configured, see .env.example')
    throw createError({ statusCode: 503, statusMessage: "The contact form isn't available right now. Please email me directly." })
  }

  try {
    await sendContactMail(message)
  } catch (error) {
    console.error('[contact] Sending failed:', error instanceof Error ? error.message : error)
    throw createError({ statusCode: 502, statusMessage: "Your message couldn't be sent. Please email me directly." })
  }

  return { ok: true }
})
