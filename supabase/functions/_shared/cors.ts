// Shared CORS and rate limiting utilities for Supabase Edge Functions

const ALLOWED_ORIGINS = [
  'https://summis.app',
  'https://www.summis.app',
  'http://localhost:8081',
  'http://localhost:19006',
];

export const corsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o))
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Cron-Secret',
    'Content-Type': 'application/json',
  };
};

/** Handle CORS preflight OPTIONS request. */
export function handleCorsPreFlight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  return null;
}

// ── Simple in-memory rate limiter ──

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a user has exceeded the rate limit.
 * Returns true if the request should be blocked.
 */
export function isRateLimited(
  userId: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}
