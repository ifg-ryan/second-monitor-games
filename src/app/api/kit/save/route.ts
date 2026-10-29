import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { kitGame } from '@/lib/kitGames';
import { applyWrite, parseData, parseWrite } from '@/lib/gameSave';

// Cloud save for kit games: a signed-in player's saved progress per game.
//   GET  /api/kit/save?game=fiver               -> { user, rev, keys }      (401 for guests)
//   POST /api/kit/save { game, base, set, del }  -> { ok: true, rev }
//        or 409 { ok: false, conflict: true, remote: { user, rev, keys } } when the account
//        changed since `base` (another device saved first). The kit merges and retries later.

const unavailable = () => NextResponse.json({ error: 'Cloud save is unavailable right now' }, { status: 503 });

async function current(userId: string, game: string) {
  const row = await prisma.gameSave.findUnique({ where: { userId_game: { userId, game } } });
  return { user: userId, rev: row?.rev ?? 0, keys: parseData(row?.data) };
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ signedIn: false }, { status: 401 });
  const game = kitGame(new URL(request.url).searchParams.get('game'));
  if (!game) return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
  try {
    return NextResponse.json(await current(userId, game.id), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ signedIn: false }, { status: 401 });
  const body = await request.json().catch(() => null);
  const game = kitGame(body?.game);
  if (!game) return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
  const write = parseWrite(body);
  if (typeof write === 'string') return NextResponse.json({ error: write }, { status: 400 });

  const conflict = async () => NextResponse.json({ ok: false, conflict: true, remote: await current(userId, game.id) }, { status: 409 });
  try {
    // Written for another account (signed out and in as someone else with the game open): refuse.
    if (write.user !== null && write.user !== userId) return conflict();
    const row = await prisma.gameSave.findUnique({ where: { userId_game: { userId, game: game.id } } });
    if ((row?.rev ?? 0) !== write.base) return conflict();
    const next = applyWrite(parseData(row?.data), write);
    if (typeof next === 'string') return NextResponse.json({ error: next }, { status: 413 });
    const data = JSON.stringify(next);
    if (row) {
      // Only if nobody else wrote in between.
      const r = await prisma.gameSave.updateMany({ where: { id: row.id, rev: write.base }, data: { rev: write.base + 1, data } });
      if (r.count === 0) return conflict();
    } else {
      try {
        await prisma.gameSave.create({ data: { userId, game: game.id, rev: 1, data } });
      } catch {
        return conflict(); // another device created it first
      }
    }
    return NextResponse.json({ ok: true, rev: write.base + 1 });
  } catch {
    return unavailable();
  }
}
