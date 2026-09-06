import type { NextFunction, Request, Response } from 'express';

type Options = {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
};

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

function keyFor(req: Request, keyPrefix: string) {
  return `${keyPrefix}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
}

export function createRateLimit(options: Options) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyFor(req, options.keyPrefix);
    const current = buckets.get(key);
    const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + options.windowMs } : current;
    entry.count += 1;
    buckets.set(key, entry);

    const remaining = Math.max(0, options.maxRequests - entry.count);
    res.setHeader('RateLimit-Limit', String(options.maxRequests));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > options.maxRequests) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - now) / 1000))));
      res.status(429).json({ error: 'Muitas solicitações. Aguarde alguns minutos e tente novamente.' });
      return;
    }
    next();
  };
}

export function cleanupRateLimitBuckets(now = Date.now()) {
  for (const [key, entry] of Array.from(buckets.entries())) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}
