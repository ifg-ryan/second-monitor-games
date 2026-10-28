import { NextResponse } from 'next/server';
import { LAB_COOKIE, TESTER_COOKIE, labToken } from '@/lib/lab';

// POST /api/lab/login { passcode }   lets this browser into /lab and shows the Feedback button in games.
// DELETE /api/lab/login               signs this browser out of the lab.
const DAYS_90 = 60 * 60 * 24 * 90;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = labToken(body?.passcode);
  if (!token) return NextResponse.json({ error: 'Wrong passcode' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  const base = { path: '/', maxAge: DAYS_90, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production' };
  res.cookies.set(LAB_COOKIE, token, { ...base, httpOnly: true });
  res.cookies.set(TESTER_COOKIE, '1', base);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(LAB_COOKIE);
  res.cookies.delete(TESTER_COOKIE);
  return res;
}
