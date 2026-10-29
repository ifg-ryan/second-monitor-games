import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { claimGuest, GUEST_ID } from '@/lib/accounts';

// POST /api/user/claim-guest  { guestId, unlocks: { gameId: [achievementId] } }
// Called once from /welcome: moves this browser's guest scores, play stats and achievements to the new account.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const guestId = typeof body.guestId === 'string' && GUEST_ID.test(body.guestId) ? body.guestId : null;
  const unlocks = body.unlocks && typeof body.unlocks === 'object' ? body.unlocks : {};
  try {
    const r = await claimGuest(userId, guestId, unlocks);
    return NextResponse.json({ ok: true, ...r });
  } catch {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503 });
  }
}
