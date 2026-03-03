import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_GAMES = ['block-fall', 'the-escape'];

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
      userId: true,
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

  const user = await currentUser();
  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    'Player';

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
  if (typeof score !== 'number' || score < 0 || !Number.isInteger(score)) {
    return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
  }

  // Only update if it's a new personal best
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
