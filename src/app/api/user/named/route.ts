import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { namedCookie } from '@/lib/accounts';
import { safeNext } from '@/lib/safeNext';

// GET /api/user/named?next=/play/fiver
// The page check sends signed-in players here when this browser hasn't seen their username yet.
// Has a username: remember it in a cookie and carry on to `next`. No username: go pick one at /welcome.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get('next'));
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL(next, url));
  let named: boolean;
  try {
    named = !!(await prisma.user.findUnique({ where: { clerkId: userId }, select: { username: true } }))?.username;
  } catch {
    // Database unreachable: let them through for a few minutes rather than loop.
    const res = NextResponse.redirect(new URL(next, url));
    res.cookies.set({ ...namedCookie(userId), maxAge: 300 });
    return res;
  }
  if (!named) return NextResponse.redirect(new URL(`/welcome?next=${encodeURIComponent(next)}`, url));
  const res = NextResponse.redirect(new URL(next, url));
  res.cookies.set(namedCookie(userId));
  return res;
}
