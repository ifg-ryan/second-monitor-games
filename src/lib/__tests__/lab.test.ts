import { describe, it, expect, beforeEach, vi } from 'vitest';
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
import { labToken, isRunner, cleanContext, cleanText } from '../lab';

describe('lab', () => {
  beforeEach(() => {
    process.env.LAB_PASSCODE = 'fox-den';
    process.env.LAB_RUNNER_KEY = 'runner-secret';
  });

  it('gives a token only for the right passcode', () => {
    expect(labToken('fox-den')).toMatch(/^[0-9a-f]{64}$/);
    expect(labToken(' fox-den ')).toBe(labToken('fox-den'));
    expect(labToken('nope')).toBeNull();
    expect(labToken('')).toBeNull();
    delete process.env.LAB_PASSCODE;
    expect(labToken('fox-den')).toBeNull();
  });

  it('checks the runner key, forgiving stray spaces and quotes', async () => {
    const req = (h?: string) => new Request('https://x/api', { headers: h ? { authorization: h } : {} });
    expect(await isRunner(req('Bearer runner-secret'))).toBe(true);
    process.env.LAB_RUNNER_KEY = ' "runner-secret"\n';
    expect(await isRunner(req('Bearer runner-secret '))).toBe(true);
    expect(await isRunner(req('Bearer wrong'))).toBe(false);
    expect(await isRunner(req())).toBe(false);
    expect(await isRunner(req('Bearer not.a.realjwt'))).toBe(false);
  });

  it('keeps only known context fields', () => {
    expect(JSON.parse(cleanContext({ build: 'abc1234', seconds: 75.6, screen: '1280x720', evil: 'x' })!)).toEqual({ build: 'abc1234', seconds: 76, screen: '1280x720' });
    expect(cleanContext(null)).toBeNull();
    expect(cleanContext({ nope: 1 })).toBeNull();
  });

  it('trims and caps text', () => {
    expect(cleanText('  hi  ')).toBe('hi');
    expect(cleanText('   ')).toBeNull();
    expect(cleanText(5)).toBeNull();
    expect(cleanText('x'.repeat(10), 4)).toBe('xxxx');
  });
});
