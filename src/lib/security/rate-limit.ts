/**
 * Server-Side Sliding Window Rate Limiter
 * Protects sensitive endpoints (auth, waitlist, interests, messages, reports, payments)
 * against automated abuse.
 */

interface RateLimitBucket {
  timestamps: number[];
}

const store = new Map<string, RateLimitBucket>();

export interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);

  if (bucket.timestamps.length >= limit) {
    const oldestInWindow = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));
    store.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.timestamps.length),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitStoreForTests(): void {
  store.clear();
}
