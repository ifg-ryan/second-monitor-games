// Site-wide achievements, earned across all kit games. Stored with game "site".
import { prisma } from '@/lib/prisma';
import { KIT_GAMES, gameOfKey } from '@/lib/kitGames';

export const SITE_ACHIEVEMENTS = [
  { id: 'first-score', name: 'On the Board', description: 'Post your first score to a leaderboard' },
  { id: 'explorer', name: 'Explorer', description: 'Play 3 different games' },
  { id: 'completionist', name: 'Tour Guide', description: 'Play every game on the site' },
  { id: 'regular', name: 'Regular', description: 'Finish 25 games' },
  { id: 'podium', name: 'Podium', description: 'Reach the top 3 on any leaderboard' },
] as const;

/** Grant site achievements after a signed-in player posts a score. Returns newly unlocked ids. */
export async function grantSiteAchievements(userId: string, rank: number): Promise<string[]> {
  const rows = await prisma.kitScore.findMany({ where: { playerId: userId }, select: { game: true, plays: true } });
  const games = new Set(rows.map((r) => gameOfKey(r.game))).size;
  const plays = rows.reduce((n, r) => n + r.plays, 0);
  const earned: string[] = ['first-score'];
  if (games >= 3) earned.push('explorer');
  if (KIT_GAMES.length > 0 && games >= KIT_GAMES.length) earned.push('completionist');
  if (plays >= 25) earned.push('regular');
  if (rank <= 3) earned.push('podium');
  const have = await prisma.achievement.findMany({ where: { userId, game: 'site', key: { in: earned } }, select: { key: true } });
  const fresh = earned.filter((k) => !have.some((h) => h.key === k));
  if (fresh.length) await prisma.achievement.createMany({ data: fresh.map((key) => ({ userId, game: 'site', key })), skipDuplicates: true });
  return fresh;
}
