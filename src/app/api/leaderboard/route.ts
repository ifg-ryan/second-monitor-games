import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_GAMES = ['block-fall', 'the-escape'];

// ── Simple in-memory rate limiter (1 POST per 5 seconds per user) ─────────────
// Note: resets on server restart; adequate for single-instance Vercel deployment.
const _lastSubmit = new Map<string, number>();

function isRateLimited(userId: string): boolean {
  const last = _lastSubmit.get(userId) ?? 0;
  const now  = Date.now();
  if (now - last < 5_000) return true;
  _lastSubmit.set(userId, now);
  return false;
}

// ── Sanitise display names coming from Clerk profile data ─────────────────────
// Max 30 chars, printable ASCII only, falls back to "Player".
function sanitizeUserName(raw: string | null | undefined): string {
  if (!raw) return 'Player';
  const cleaned = raw.replace(/[^\x20-\x7E]/g, '').trim().slice(0, 30);
  return cleaned || 'Player';
}

// GET /api/leaderboard?game=block-fall
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const game = searchParams.get('game');

  if (!game || !VALID_GAMES.includes(game)) {
    return NextResponse.json({ error: 'Invalid game parameter' }, { status: 400 });
  }

  const scores = await prisma.leaderboardScore.findMany({
    where: { game },
    orderBy: { score: 'desc' },
    take: 20,
    select: {
      id: true,
      userName: true,
      score: true,
      lines: true,
      level: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ scores });
}

// POST /api/leaderboard  — saves/updates a user's best score
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Rate limit ────────────────────────────────────────────────────────────
  if (isRateLimited(userId)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // ── Resolve display name (prefer our DB username, fall back to Clerk) ─────
  const [dbUser, clerkUser] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId }, select: { username: true } }),
    currentUser(),
  ]);
  const rawName =
    dbUser?.username ??
    clerkUser?.username ??
    clerkUser?.firstName ??
    clerkUser?.fullName ??
    null;
  const userName = sanitizeUserName(rawName);

  // ── Parse + validate body ─────────────────────────────────────────────────
  let body: { game: string; score: number; lines?: number; level?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { game, score, lines = 0, level = 1 } = body;

  if (!game || !VALID_GAMES.includes(game)) {
    return NextResponse.json({ error: 'Invalid game' }, { status: 400 });
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || !Number.isInteger(score) || score < 0 || score > 10_000_000) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }
  if (typeof lines !== 'number' || !Number.isFinite(lines) || !Number.isInteger(lines) || lines < 0 || lines > 100_000) {
    return NextResponse.json({ error: 'Invalid lines' }, { status: 400 });
  }
  if (typeof level !== 'number' || !Number.isFinite(level) || !Number.isInteger(level) || level < 1 || level > 999) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  }

  // ── Only update if it's a new personal best ───────────────────────────────
  const existing = await prisma.leaderboardScore.findUnique({
    where: { game_userId: { game, userId } },
  });

  if (existing && score <= existing.score) {
    // Not a new best — return current rank without writing
    const rank = await prisma.leaderboardScore.count({
      where: { game, score: { gt: existing.score } },
    }) + 1;
    return NextResponse.json({ saved: false, message: 'Not a new personal best', rank });
  }

  await prisma.leaderboardScore.upsert({
    where: { game_userId: { game, userId } },
    update: { score, lines, level, userName },
    create: { game, userId, userName, score, lines, level },
  });

  // Rank = number of players with a strictly higher score + 1
  const rank = await prisma.leaderboardScore.count({
    where: { game, score: { gt: score } },
  }) + 1;

  return NextResponse.json({ saved: true, rank });
}
