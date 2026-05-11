import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(12, '10 s'),
      analytics: true,
    })
  : null;

export async function rateLimit(request: NextRequest, keyPrefix: string) {
  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  const ip =
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous';

  return limiter.limit(`${keyPrefix}:${ip}`);
}
