import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calculateAccessExpiry, isAccessExpired } from './auth';

describe('individual access expiry', () => {
  const now = new Date('2026-08-19T10:00:00.000Z');

  it('calculates a 90-day sale period from the activation date', () => {
    expect(calculateAccessExpiry(90, now).toISOString()).toBe('2026-11-17T10:00:00.000Z');
  });

  it('blocks expired student accounts but never expires the master account', () => {
    const expired = new Date('2026-08-19T09:59:59.000Z');
    expect(isAccessExpired({ isMaster: false, accessExpiresAt: expired }, now)).toBe(true);
    expect(isAccessExpired({ isMaster: true, accessExpiresAt: expired }, now)).toBe(false);
    expect(isAccessExpired({ isMaster: false, accessExpiresAt: null }, now)).toBe(false);
  });

  it('enforces expiry in the protected middleware and keeps renewal restricted to administrators', () => {
    const trpc = readFileSync(new URL('./_core/trpc.ts', import.meta.url), 'utf8');
    const routers = readFileSync(new URL('./routers.ts', import.meta.url), 'utf8');
    const schema = readFileSync(new URL('../drizzle/schema.ts', import.meta.url), 'utf8');
    expect(schema).toContain('accessExpiresAt: timestamp("accessExpiresAt")');
    expect(trpc).toContain('if (isAccessExpired(ctx.user))');
    expect(routers).toContain('renewUserAccess: protectedProcedure');
    expect(routers).toContain("if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' })");
  });
});
