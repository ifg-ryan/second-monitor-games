// Loads the Play table as per-day totals and player-days (four groupBy queries), for the lab's
// Games page and the weekly stats export. The math on these rows lives in playStats.ts.
import { prisma } from '@/lib/prisma';
import { QUICK_QUIT_SECONDS, atlanticDay, type DayRow, type PlayerDay } from '@/lib/playStats';

/** Every day's totals; null when the table is not there yet. Tester plays are left out unless includeLab. */
export async function loadPlayRows(includeLab = false): Promise<{ rows: DayRow[]; playerDays: PlayerDay[]; today: string } | null> {
  const where = includeLab ? {} : { lab: false };
  try {
    const [all, quick, done, playerDays] = await Promise.all([
      prisma.play.groupBy({ by: ['game', 'day'], where, _count: { _all: true }, _sum: { seconds: true } }),
      prisma.play.groupBy({ by: ['game', 'day'], where: { ...where, seconds: { lt: QUICK_QUIT_SECONDS } }, _count: { _all: true } }),
      prisma.play.groupBy({ by: ['game', 'day'], where: { ...where, runs: { gt: 0 } }, _count: { _all: true } }),
      prisma.play.groupBy({ by: ['game', 'playerId', 'day'], where }),
    ]);
    type Count = { game: string; day: string; _count: { _all: number } };
    const key = (r: { game: string; day: string }) => `${r.game}|${r.day}`;
    const quickBy = new Map((quick as Count[]).map((r) => [key(r), r._count._all]));
    const doneBy = new Map((done as Count[]).map((r) => [key(r), r._count._all]));
    const rows: DayRow[] = (all as (Count & { _sum: { seconds: number | null } })[]).map((r) => ({ game: r.game, day: r.day, plays: r._count._all, seconds: r._sum.seconds ?? 0, quick: quickBy.get(key(r)) ?? 0, done: doneBy.get(key(r)) ?? 0 }));
    return { rows, playerDays: playerDays as PlayerDay[], today: atlanticDay() };
  } catch {
    return null;
  }
}
