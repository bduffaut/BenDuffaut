// Fixed-window rate limiter kept in memory. The site runs as one container, so this is
// enough; a second replica would need Redis or similar instead.

export interface RateLimiter {
  /* Records a hit and returns whether it's allowed, plus seconds until the window resets */
  hit(key: string, now?: number): { allowed: boolean; retryAfter: number }
}

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return {
    hit(key, now = Date.now()) {
      // Drop expired entries now and then so the map can't grow without bound
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
      }

      const entry = hits.get(key)
      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, retryAfter: 0 }
      }

      entry.count++
      return { allowed: entry.count <= limit, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
    },
  }
}
