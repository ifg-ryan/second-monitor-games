// Accounts: the site's own record of a Clerk user, their username, moving guest progress to
// a new account, and deleting an account.
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { kitGame } from '@/lib/kitGames';
import { checkUsername } from '@/lib/usernames';
import { grantSiteAchievements } from '@/lib/siteAchievements';

import { NAMED_COOKIE } from '@/lib/accounts-cookie';
export { NAMED_COOKIE };

/** Cookie that lets a signed-in player past the "pick a username" check (value: their user id). */
export const namedCookie = (userId: string) => ({ name: NAMED_COOKIE, value: userId, httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 });

export const GUEST_ID = /^g[a-z0-9]{6,40}$/;

/** The User row for a Clerk user, created (with their real email) if the webhook hasn't made it yet. */
export async function ensureUser(clerkId: string) {
  const found = await prisma.user.findUnique({ where: { clerkId } });
  if (found && !found.email.endsWith('@placeholder')) return found;
  const cu = await currentUser().catch(() => null);
  const email = cu?.primaryEmailAddress?.emailAddress ?? cu?.emailAddresses[0]?.emailAddress ?? `${clerkId}@placeholder`;
  return upsertUser(clerkId, email);
}

const isUniqueError = (e: unknown) => typeof e === 'object' && !!e && 'code' in e && (e as { code: string }).code === 'P2002';

/**
 * Create or update the User row for a Clerk id. If another row already has this email (an account
 * from Clerk's old development setup, or a deleted Clerk user), that stale row is removed first.
 */
export async function upsertUser(clerkId: string, email: string) {
  const write = () => prisma.user.upsert({ where: { clerkId }, create: { clerkId, email }, update: { email } });
  try {
    return await write();
  } catch (e) {
    if (!isUniqueError(e)) throw e;
    await prisma.user.deleteMany({ where: { email, NOT: { clerkId } } });
    return write();
  }
}

export type SetNameResult = { ok: true; username: string } | { ok: false; error: string; status: number };

/** Whether a name can be taken by this user (format, ban list, and not someone else's). */
export async function nameAvailable(raw: unknown, clerkId: string | null): Promise<SetNameResult> {
  const check = checkUsername(raw);
  if (!check.ok) return { ok: false, error: check.error, status: 422 };
  const owner = await prisma.username.findUnique({ where: { key: check.key }, select: { userId: true } });
  if (owner && owner.userId !== clerkId) return { ok: false, error: 'That name is taken.', status: 409 };
  return { ok: true, username: check.name };
}

/** Set or change a username. Also renames the player's leaderboard rows. */
export async function setUsername(clerkId: string, raw: unknown): Promise<SetNameResult> {
  const check = checkUsername(raw);
  if (!check.ok) return { ok: false, error: check.error, status: 422 };
  await ensureUser(clerkId);
  try {
    await prisma.$transaction([
      prisma.username.deleteMany({ where: { userId: clerkId, NOT: { key: check.key } } }),
      prisma.username.upsert({ where: { userId: clerkId }, create: { key: check.key, userId: clerkId }, update: { key: check.key } }),
      prisma.user.update({ where: { clerkId }, data: { username: check.name } }),
      prisma.kitScore.updateMany({ where: { playerId: clerkId }, data: { name: check.name } }),
    ]);
  } catch (err) {
    if (isUniqueError(err)) return { ok: false, error: 'That name is taken.', status: 409 };
    throw err;
  }
  return { ok: true, username: check.name };
}

/** How a guest's leaderboard row and the account's row for the same game combine. */
export function mergeScores(account: { score: number; plays: number } | null, guest: { score: number; plays: number }, lowerIsBetter: boolean) {
  if (!account) return { score: guest.score, plays: guest.plays };
  const better = lowerIsBetter ? Math.min(account.score, guest.score) : Math.max(account.score, guest.score);
  return { score: better, plays: account.plays + guest.plays };
}

/**
 * Move a guest's progress (this browser) to a signed-in account: leaderboard rows (better score
 * kept, plays added), play stats, and achievements unlocked as a guest in any game.
 * `unlocks` is { gameId: [achievementId, ...] } read from the browser's saved data.
 */
export async function claimGuest(clerkId: string, guestId: string | null, unlocks: Record<string, unknown>) {
  const user = await ensureUser(clerkId);
  const guestPlayer = guestId ? `guest:${guestId}` : null;
  const guestRows = guestPlayer ? await prisma.kitScore.findMany({ where: { playerId: guestPlayer } }) : [];
  let moved = 0;
  let bestRank = Infinity;
  for (const g of guestRows) {
    const game = kitGame(g.game);
    const lower = !!game?.score.lowerIsBetter;
    const mine = await prisma.kitScore.findUnique({ where: { game_playerId: { game: g.game, playerId: clerkId } } });
    const merged = mergeScores(mine, g, lower);
    await prisma.$transaction([
      prisma.kitScore.delete({ where: { id: g.id } }),
      prisma.kitScore.upsert({
        where: { game_playerId: { game: g.game, playerId: clerkId } },
        create: { game: g.game, playerId: clerkId, name: user.username ?? g.name, score: merged.score, plays: merged.plays, isGuest: false },
        update: { score: merged.score, plays: merged.plays },
      }),
    ]);
    const rank = (await prisma.kitScore.count({ where: { game: g.game, score: lower ? { lt: merged.score } : { gt: merged.score } } })) + 1;
    bestRank = Math.min(bestRank, rank);
    moved++;
  }
  if (guestPlayer) await prisma.play.updateMany({ where: { playerId: guestPlayer }, data: { playerId: clerkId } });

  const rows: { userId: string; game: string; key: string }[] = [];
  for (const [id, list] of Object.entries(unlocks ?? {})) {
    const game = kitGame(id);
    if (!game || !Array.isArray(list)) continue;
    for (const key of list.slice(0, 50)) if (typeof key === 'string' && game.achievements.some((a) => a.id === key)) rows.push({ userId: clerkId, game: game.id, key });
  }
  if (rows.length) await prisma.achievement.createMany({ data: rows.slice(0, 2000), skipDuplicates: true });
  const site = moved ? await grantSiteAchievements(clerkId, bestRank) : [];
  return { scores: moved, achievements: rows.length, site };
}

/** Remove everything the site keeps about a player. Clerk's own record is deleted by the caller. */
export async function deleteAccountData(clerkId: string) {
  await prisma.$transaction([
    prisma.achievement.deleteMany({ where: { userId: clerkId } }),
    prisma.kitScore.deleteMany({ where: { playerId: clerkId } }),
    prisma.play.deleteMany({ where: { playerId: clerkId } }),
    prisma.username.deleteMany({ where: { userId: clerkId } }),
    prisma.user.deleteMany({ where: { clerkId } }),
  ]);
}
