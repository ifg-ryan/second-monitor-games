import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { kitGame } from '@/lib/kitGames';
import { kitPlayer, sanitizeName } from '@/lib/kitPlayer';
import { containsBadWord } from '@/lib/wordFilter';
import { grantSiteAchievements } from '@/lib/siteAchievements';
import { accountLevel } from '@/lib/xp';

// Scores for Claude Games kit games. One row per player per game holding their best.
// Signed-in players post under their account; guests post under a nickname with a browser id.

const lastPost = new Map<string, number>();
const tooSoon = (key: string) => {
  const now = Date.now();
  if (now - (lastPost.get(key) ?? 0) < 3000) return true;
  lastPost.set(key, now);
  return false;
};
const GUEST_ID = /^g[a-z0-9]{6,40}$/;

const unavailable = () => NextResponse.json({ error: 'Leaderboards are unavailable right now' }, { status: 503 });

/** How many players are strictly better than this score, plus one. */
async function rankOf(game: string, score: number, lowerIsBetter: boolean): Promise<number> {
  return (await prisma.kitScore.count({ where: { game, score: lowerIsBetter ? { lt: score } : { gt: score } } })) + 1;
}

// GET /api/kit/score?game=range-rush&limit=10[&guestId=...]
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const game = kitGame(params.get('game'));
  if (!game) return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
  const limit = Math.min(50, Math.max(1, Number(params.get('limit')) || 10));
  const lower = !!game.score.lowerIsBetter;
  try {
    const player = await kitPlayer();
    const guestId = params.get('guestId');
    const myId = player?.userId ?? (guestId && GUEST_ID.test(guestId) ? `guest:${guestId}` : null);
    const rows = await prisma.kitScore.findMany({
      where: { game: game.id },
      orderBy: [{ score: lower ? 'asc' : 'desc' }, { updatedAt: 'asc' }],
      take: limit,
      select: { playerId: true, name: true, score: true },
    });
    const top = rows.map((r) => ({ name: r.name, score: r.score, ...(r.playerId === myId ? { me: true } : {}) }));
    let me: { rank: number; score: number } | undefined;
    if (myId) {
      const mine = await prisma.kitScore.findUnique({ where: { game_playerId: { game: game.id, playerId: myId } }, select: { score: true } });
      if (mine) me = { rank: await rankOf(game.id, mine.score, lower), score: mine.score };
    }
    return NextResponse.json({ top, me, total: await prisma.kitScore.count({ where: { game: game.id } }) });
  } catch {
    return unavailable();
  }
}

// POST /api/kit/score  { game, score, name?, guestId? }
export async function POST(request: Request) {
  let body: { game?: string; score?: number; name?: string; guestId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const game = kitGame(body.game);
  if (!game) return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
  const score = Number(body.score);
  if (!Number.isInteger(score) || score < 0 || score > game.score.max) return NextResponse.json({ error: 'Invalid score' }, { status: 400 });

  const player = await kitPlayer();
  let playerId: string;
  let name: string;
  if (player) {
    playerId = player.userId;
    name = player.name;
  } else {
    const nick = sanitizeName(body.name);
    if (!nick || !body.guestId || !GUEST_ID.test(body.guestId)) return NextResponse.json({ error: 'Guests need a nickname' }, { status: 400 });
    if (containsBadWord(nick)) return NextResponse.json({ error: 'Please choose another name' }, { status: 400 });
    playerId = `guest:${body.guestId}`;
    name = nick;
  }
  if (tooSoon(playerId)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const lower = !!game.score.lowerIsBetter;
  try {
    const existing = await prisma.kitScore.findUnique({ where: { game_playerId: { game: game.id, playerId } }, select: { score: true } });
    const better = !existing || (lower ? score < existing.score : score > existing.score);
    const best = better ? score : existing!.score;
    await prisma.kitScore.upsert({
      where: { game_playerId: { game: game.id, playerId } },
      create: { game: game.id, playerId, name, score, isGuest: !player },
      update: { name, plays: { increment: 1 }, ...(better ? { score } : {}) },
    });
    const rank = await rankOf(game.id, best, lower);
    const total = await prisma.kitScore.count({ where: { game: game.id } });
    const before = player ? await accountLevel(player.userId).catch(() => null) : null;
    const site = player ? await grantSiteAchievements(player.userId, rank).catch(() => []) : [];
    const after = player && site.length ? await accountLevel(player.userId).catch(() => null) : before;
    return NextResponse.json({ ok: true, best, newBest: better, rank, total, siteAchievements: site, ...(after ? { xp: after.xp, level: after.level, gained: after.xp - (before?.xp ?? after.xp), leveledUp: !!before && after.level > before.level } : {}) });
  } catch {
    return unavailable();
  }
}
