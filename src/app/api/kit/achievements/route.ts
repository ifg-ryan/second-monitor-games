import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { kitGame } from '@/lib/kitGames';
import { kitPlayer } from '@/lib/kitPlayer';
import { accountLevel } from '@/lib/xp';

// Achievements on the signed-in player's account.

// GET /api/kit/achievements  -> { achievements: [{ game, key, unlockedAt }] }
export async function GET() {
  const player = await kitPlayer();
  if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const achievements = await prisma.achievement.findMany({ where: { userId: player.userId }, select: { game: true, key: true, unlockedAt: true }, orderBy: { unlockedAt: 'desc' } });
    return NextResponse.json({ achievements });
  } catch {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
}

// POST /api/kit/achievements  { game, ids: [...] }  (ids must exist in the game's game.json)
//   -> { ok, saved, xp, level, gained, leveledUp }  (account XP after these unlocks)
export async function POST(request: Request) {
  const player = await kitPlayer();
  if (!player) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { game?: string; ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const game = kitGame(body.game);
  if (!game || !Array.isArray(body.ids)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const valid = body.ids.filter((id) => typeof id === 'string' && game.achievements.some((a) => a.id === id)).slice(0, 50);
  try {
    const before = await accountLevel(player.userId);
    if (valid.length) await prisma.achievement.createMany({ data: valid.map((key) => ({ userId: player.userId, game: game.id, key })), skipDuplicates: true });
    const after = valid.length ? await accountLevel(player.userId) : before;
    return NextResponse.json({ ok: true, saved: valid.length, xp: after.xp, level: after.level, levelFloor: after.floor, levelNext: after.next, gained: after.xp - before.xp, leveledUp: after.level > before.level });
  } catch {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
}
