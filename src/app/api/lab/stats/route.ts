import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { KIT_GAMES } from '@/lib/kitGames';
import { isTester, runnerProblem } from '@/lib/lab';
import { loadPlayRows } from '@/lib/playData';
import { SITE_GAMES, addDays, dauSeries, summarize } from '@/lib/playStats';
import history from '../../../../../lab-data/game-history.json';

// GET /api/lab/stats: the week in numbers, for the weekly newsletter.
// Called by claude-games .github/workflows/weekly-stats.yml (GitHub OIDC token, see runnerProblem),
// or by a lab tester in the browser. ?days=7 sets the window (this week vs the one before).

export const dynamic = 'force-dynamic';

type Version = { version: number; date: string; notes: { subject: string }[] };
const HISTORY = (history as unknown as { games: Record<string, { versions: Version[] }> }).games;

export async function GET(request: Request) {
  const problem = await runnerProblem(request, ['weekly-stats.yml']);
  if (problem && !(await isTester())) return NextResponse.json({ error: 'Not allowed', problem }, { status: 401 });
  const days = Math.min(31, Math.max(1, Number(new URL(request.url).searchParams.get('days')) || 7));

  const data = await loadPlayRows();
  if (!data) return NextResponse.json({ error: 'Play table not available yet' }, { status: 503 });
  const { rows, playerDays, today } = data;
  const week = { from: addDays(today, -(days - 1)), to: today, days };
  const prev = { from: addDays(week.from, -days), to: addDays(week.from, -1), days };
  const since = new Date(`${week.from}T04:00:00Z`); // start of the window in Atlantic time (close enough for counts)

  const title = (id: string) => KIT_GAMES.find((g) => g.id === id)?.title ?? SITE_GAMES[id] ?? id;
  const ids = [...new Set([...KIT_GAMES.map((g) => g.id), ...Object.keys(SITE_GAMES), ...rows.map((r) => r.game)])];
  const games = ids
    .map((id) => ({ id, title: title(id), week: summarize(rows, playerDays, week, id), prev: summarize(rows, playerDays, prev, id), allTimePlays: rows.filter((r) => r.game === id).reduce((n, r) => n + r.plays, 0) }))
    .sort((a, b) => b.week.plays - a.week.plays || b.allTimePlays - a.allTimePlays);

  // Players whose first play ever falls in this window.
  const firstDay = new Map<string, string>();
  for (const r of playerDays) if (!firstDay.has(r.playerId) || r.day < firstDay.get(r.playerId)!) firstDay.set(r.playerId, r.day);
  const newPlayers = [...firstDay.values()].filter((d) => d >= week.from && d <= week.to).length;

  const ships = Object.entries(HISTORY).flatMap(([id, h]) =>
    h.versions.filter((v) => v.date.slice(0, 10) >= week.from).map((v) => ({ game: id, title: title(id), version: v.version, date: v.date, changes: v.notes.map((n) => n.subject) })),
  );
  const [feedback, scores] = await Promise.all([
    prisma.feedback.count({ where: { createdAt: { gte: since } } }).catch(() => null),
    prisma.kitScore.count({ where: { updatedAt: { gte: since } } }).catch(() => null),
  ]);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    week,
    prev,
    site: { week: summarize(rows, playerDays, week, null), prev: summarize(rows, playerDays, prev, null), newPlayers },
    dau: dauSeries(playerDays, today, 14),
    games,
    newGames: KIT_GAMES.filter((g) => (g.added ?? '').slice(0, 10) >= week.from).map((g) => ({ id: g.id, title: g.title, added: g.added })),
    ships,
    feedbackNotes: feedback,
    leaderboardRowsUpdated: scores,
    trackingStarted: '2026-10-29',
  });
}
