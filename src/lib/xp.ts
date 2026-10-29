// Account XP and levels. Every achievement is worth XP (game.json `xp`, default 50; site-wide
// achievements set theirs in siteAchievements.ts). A player's XP is the total of the achievements
// on their account, so it can't drift out of step with them.
//
//   levelFor(130)     // { level: 3, xp: 130, floor: 80, next: 180 }
//
// Curve: reaching level n takes 20 x (n - 1)^2 XP in total. Two achievements reach level 3;
// level 20 takes 7,220 XP (about 145 achievements at 50).
import { prisma } from '@/lib/prisma';
import { KIT_GAMES } from '@/lib/kitGames';
import { SITE_ACHIEVEMENTS } from '@/lib/siteAchievements';

export const DEFAULT_XP = 50;
const STEP = 20;

/** Total XP needed to reach a level. */
export const xpForLevel = (level: number) => STEP * (Math.max(1, level) - 1) ** 2;

export interface Level {
  level: number;
  xp: number;
  /** XP where this level started and where the next one starts (for a progress bar). */
  floor: number;
  next: number;
}

export function levelFor(xp: number): Level {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / STEP)) + 1;
  return { level, xp, floor: xpForLevel(level), next: xpForLevel(level + 1) };
}

/** XP of each achievement, keyed "game:key" (game "site" for site-wide ones). */
export function xpTable(): Map<string, number> {
  const t = new Map<string, number>();
  for (const a of SITE_ACHIEVEMENTS) t.set(`site:${a.id}`, a.xp);
  for (const g of KIT_GAMES) for (const a of g.achievements) t.set(`${g.id}:${a.id}`, typeof a.xp === 'number' && a.xp >= 0 ? a.xp : DEFAULT_XP);
  return t;
}

const TABLE = xpTable();

/** XP for one achievement (0 for ones no longer in any game). */
export const achievementXp = (game: string, key: string) => TABLE.get(`${game}:${key}`) ?? 0;

/** XP from a list of achievements. */
export function sumXp(rows: { game: string; key: string }[]): number {
  return rows.reduce((n, r) => n + achievementXp(r.game, r.key), 0);
}

/** A player's account XP and level. */
export async function accountLevel(userId: string): Promise<Level> {
  const rows = await prisma.achievement.findMany({ where: { userId }, select: { game: true, key: true } });
  return levelFor(sumXp(rows));
}

/** Levels for many players at once (leaderboards). Guests are left out. */
export async function levelsFor(userIds: string[]): Promise<Map<string, number>> {
  const ids = [...new Set(userIds.filter((id) => !id.startsWith('guest:')))];
  const out = new Map<string, number>();
  if (!ids.length) return out;
  const rows = await prisma.achievement.findMany({ where: { userId: { in: ids } }, select: { userId: true, game: true, key: true } });
  const xp = new Map<string, number>();
  for (const r of rows) xp.set(r.userId, (xp.get(r.userId) ?? 0) + achievementXp(r.game, r.key));
  for (const id of ids) out.set(id, levelFor(xp.get(id) ?? 0).level);
  return out;
}
