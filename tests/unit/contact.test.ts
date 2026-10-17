import { describe, expect, it } from 'vitest'
import { CONTACT_LIMITS, validateContact } from '../../shared/utils/contact'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello, I would like to talk about a role.' }

describe('validateContact', () => {
  it('accepts a complete message and trims it', () => {
    const result = validateContact({ ...valid, name: '  Ada Lovelace ', company: '' })
    expect(result).toEqual({ ok: true, value: expect.objectContaining({ name: 'Ada Lovelace', company: undefined }) })
  })

  it('requires name, a valid email and a real message', () => {
    const result = validateContact({ name: '', email: 'not-an-email', message: 'hi' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual(['email', 'message', 'name'])
  })

  it('rejects overlong fields', () => {
    const result = validateContact({ ...valid, message: 'x'.repeat(CONTACT_LIMITS.message + 1) })
    expect(result.ok).toBe(false)
  })

  it('strips control characters so headers cannot be injected', () => {
    const result = validateContact({ ...valid, name: 'Ada\r\nBcc: victim@example.com' })
    expect(result.ok && result.value.name).toBe('Ada Bcc: victim@example.com')
  })

  it('ignores non-string input', () => {
    const result = validateContact({ ...valid, email: 42 as unknown as string })
    expect(result.ok).toBe(false)
  })
})
