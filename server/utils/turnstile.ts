// Cloudflare Turnstile, optional bot check for the contact form. Active only when both
// the site key (build time) and the secret (runtime) are set.

export async function verifyTurnstile(token: string | undefined, ip: string | undefined): Promise<boolean> {
  const { contact, public: config } = useRuntimeConfig()
  const secret = contact.turnstileSecret
  // Without the site key the form never shows the check, so requiring it would reject everyone
  if (!secret || !config.turnstileSiteKey) return true
  if (!token) return false

  try {
    const result = await $fetch<{ success: boolean }>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: { secret, response: token, remoteip: ip },
      timeout: 5000,
    })
    return result.success
  } catch {
    return false
  }
}
