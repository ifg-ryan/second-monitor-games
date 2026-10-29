import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { kitGame } from '@/lib/kitGames';
import { isTester } from '@/lib/lab';
import { atlanticDay } from '@/lib/playStats';

// POST /api/kit/play  { id, game, guestId, seconds, runs }
// Play stats: one row per play, created by the first beat and updated by later ones (about one a
// minute, one per finished run, one when the tab closes). Sent with sendBeacon, so it answers 204
// and never fails loudly. Seconds only grow, so a late, older beat cannot undo a newer one.

const PLAY_ID = /^p[a-z0-9]{8,40}$/;
const GUEST_ID = /^g[a-z0-9]{6,40}$/;
const MAX_SECONDS = 6 * 3600;
const done = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  let b: { id?: string; game?: string; guestId?: string; seconds?: number; runs?: number };
  try {
    b = JSON.parse(await request.text());
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  const game = typeof b.game === 'string' && kitGame(b.game) ? b.game : null;
  const seconds = Math.min(MAX_SECONDS, Math.max(0, Math.floor(Number(b.seconds) || 0)));
  const runs = Math.min(1000, Math.max(0, Math.floor(Number(b.runs) || 0)));
  if (!game || !b.id || !PLAY_ID.test(b.id) || !b.guestId || !GUEST_ID.test(b.guestId)) return new Response('Bad play', { status: 400 });

  try {
    const updated = await prisma.play.updateMany({ where: { id: b.id, game, seconds: { lte: seconds } }, data: { seconds, runs } });
    if (updated.count) return done();
    const { userId } = await auth();
    await prisma.play
      .create({ data: { id: b.id, game, playerId: userId ?? `guest:${b.guestId}`, day: atlanticDay(), seconds, runs, lab: await isTester() } })
      .catch(() => {}); // already there (an older beat arriving late): nothing to do
  } catch {
    // stats are best effort; the game never notices
  }
  return done();
}
