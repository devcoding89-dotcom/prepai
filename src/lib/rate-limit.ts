import "server-only";

// ---------------------------------------------------------------------------
// Tiny in-memory sliding-window rate limiter.
//
// Good enough for a single-server deployment (the common case for this app).
// On serverless/multi-instance each instance keeps its own count, so the
// effective limit becomes limit × instances — still a meaningful brake on
// abuse, and a Redis-backed store can be swapped in later behind the same
// interface.
// ---------------------------------------------------------------------------

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

// Periodically sweep expired buckets so the map does not grow forever.
const SWEEP_EVERY_MS = 10 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < SWEEP_EVERY_MS);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  /** Whether the action is allowed. */
  ok: boolean;
  /** Seconds until the caller may retry (only meaningful when ok === false). */
  retryAfterSeconds: number;
  /** How many calls remain in the current window. */
  remaining: number;
}

/**
 * Record one hit against `key` and report whether it is within budget.
 *
 * @param key       Unique caller identity, e.g. `ai:${userId}` or `login:${email}`.
 * @param limit     Maximum hits allowed inside the window.
 * @param windowMs  Window length in milliseconds.
 */
export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    buckets.set(key, bucket);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
      remaining: 0,
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true, retryAfterSeconds: 0, remaining: limit - bucket.hits.length };
}

/** Clear all hits for a key — used e.g. after a successful login. */
export function reset(key: string) {
  buckets.delete(key);
}