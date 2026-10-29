import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { nameAvailable, namedCookie, setUsername } from '@/lib/accounts';

// GET /api/user/username?check=Ryan_F  -> { ok: true } or { ok: false, error }
// Lets the username box say "available" or "taken" as you type.
export async function GET(req: Request) {
  const { userId } = await auth();
  const name = new URL(req.url).searchParams.get('check');
  try {
    const r = await nameAvailable(name, userId);
    return NextResponse.json(r.ok ? { ok: true } : { ok: false, error: r.error });
  } catch {
    return NextResponse.json({ ok: false, error: "Can't check right now." }, { status: 503 });
  }
}

// POST /api/user/username  { username }  -> { username }
// Sets or changes the signed-in player's username, renames their leaderboard rows,
// and lets them past the "pick a username" check on every page.
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    const r = await setUsername(userId, body.username);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
    const res = NextResponse.json({ username: r.username });
    res.cookies.set(namedCookie(userId));
    return res;
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
