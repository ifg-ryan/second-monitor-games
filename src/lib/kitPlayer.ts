// Who is calling a kit API: a signed-in Clerk user (with their display name), or nobody.
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export function sanitizeName(raw: string | null | undefined, max = 20): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
  return cleaned || null;
}

export async function kitPlayer(): Promise<{ userId: string; name: string } | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const [dbUser, clerkUser] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId }, select: { username: true } }).catch(() => null),
    currentUser(),
  ]);
  const name = sanitizeName(dbUser?.username ?? clerkUser?.username ?? clerkUser?.firstName ?? clerkUser?.fullName, 30) ?? 'Player';
  return { userId, name };
}
