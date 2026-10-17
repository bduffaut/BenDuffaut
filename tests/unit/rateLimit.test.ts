import { describe, expect, it } from 'vitest'
import { createRateLimiter } from '../../server/utils/rateLimit'

describe('createRateLimiter', () => {
  it('allows up to the limit, then blocks until the window resets', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(limiter.hit('a', 0).allowed).toBe(true)
    expect(limiter.hit('a', 100).allowed).toBe(true)
    expect(limiter.hit('a', 200)).toEqual({ allowed: false, retryAfter: 1 })
    expect(limiter.hit('a', 1000).allowed).toBe(true)
  })

  it('tracks keys separately', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(limiter.hit('a', 0).allowed).toBe(true)
    expect(limiter.hit('b', 0).allowed).toBe(true)
    expect(limiter.hit('a', 0).allowed).toBe(false)
  })
})
