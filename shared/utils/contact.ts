// Contact form rules, shared by the form (instant feedback) and the API (the real check).

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  company: 120,
  message: 5000,
  messageMin: 10,
} as const

export interface ContactInput {
  name: string
  email: string
  company?: string
  message: string
  /* Honeypot, hidden from people. Bots that fill it in are dropped quietly. */
  website?: string
  /* When the form was rendered, to catch instant bot submissions */
  startedAt?: number
  turnstileToken?: string
}

export type ContactErrors = Partial<Record<'name' | 'email' | 'company' | 'message', string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateContact(input: Partial<ContactInput>): { ok: true; value: ContactInput } | { ok: false; errors: ContactErrors } {
  const name = clean(input.name)
  const email = clean(input.email)
  const company = clean(input.company)
  const message = (typeof input.message === 'string' ? input.message : '').trim()
  const errors: ContactErrors = {}

  if (!name) errors.name = 'Please add your name.'
  else if (name.length > CONTACT_LIMITS.name) errors.name = `Keep it under ${CONTACT_LIMITS.name} characters.`

  if (!email) errors.email = 'Please add your email so I can reply.'
  else if (email.length > CONTACT_LIMITS.email || !EMAIL.test(email)) errors.email = "That email doesn't look right."

  if (company.length > CONTACT_LIMITS.company) errors.company = `Keep it under ${CONTACT_LIMITS.company} characters.`

  if (message.length < CONTACT_LIMITS.messageMin) errors.message = 'A little more detail, please.'
  else if (message.length > CONTACT_LIMITS.message) errors.message = `Keep it under ${CONTACT_LIMITS.message} characters.`

  if (Object.keys(errors).length) return { ok: false, errors }

  return {
    ok: true,
    value: {
      name,
      email,
      company: company || undefined,
      message,
      website: clean(input.website),
      startedAt: typeof input.startedAt === 'number' ? input.startedAt : undefined,
      turnstileToken: typeof input.turnstileToken === 'string' ? input.turnstileToken : undefined,
    },
  }
}

/* Single line, trimmed, with control characters removed so nothing can inject email headers */
function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()
}
