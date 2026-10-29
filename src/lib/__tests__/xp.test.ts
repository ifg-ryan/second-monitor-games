import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/prisma', () => ({ prisma: {} }));
import { levelFor, xpForLevel, sumXp, DEFAULT_XP } from '../xp';
import { KIT_GAMES } from '../kitGames';

describe('account levels', () => {
  it('starts at level 1 and climbs on the curve', () => {
    expect(levelFor(0)).toEqual({ level: 1, xp: 0, floor: 0, next: 20 });
    expect(levelFor(50).level).toBe(2);
    expect(levelFor(100).level).toBe(3);
    expect(levelFor(xpForLevel(20)).level).toBe(20);
    expect(levelFor(xpForLevel(20) - 1).level).toBe(19);
  });
  it('the bar always sits inside the level', () => {
    for (const xp of [0, 1, 19, 20, 79, 80, 5000, 12345]) {
      const l = levelFor(xp);
      expect(l.floor).toBeLessThanOrEqual(xp);
      expect(l.next).toBeGreaterThan(xp);
    }
  });
  it('sums achievement XP with the default and site values', () => {
    const g = KIT_GAMES.find((x) => x.achievements.length)!;
    expect(sumXp([{ game: g.id, key: g.achievements[0].id }])).toBe(g.achievements[0].xp ?? DEFAULT_XP);
    expect(sumXp([{ game: 'site', key: 'podium' }])).toBe(250);
    expect(sumXp([{ game: 'gone', key: 'x' }])).toBe(0);
  });
});
