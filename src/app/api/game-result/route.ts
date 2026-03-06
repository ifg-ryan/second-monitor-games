import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/game-result — saves a GAME_OVER payload to the database
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    game: string;
    gameType: string;
    smgVersion: string;
    date: string;
    puzzleNumber: number;
    score: number;
    completed: boolean;
    shareText?: string;
    streak?: number;
    maxStreak?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { game, gameType, smgVersion, date, puzzleNumber, score, completed, shareText, streak, maxStreak } = body;

  // Validate required fields
  if (!game || typeof game !== "string" || game.length > 50) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }
  if (gameType !== "puzzle" && gameType !== "arcade") {
    return NextResponse.json({ error: "Invalid gameType" }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (typeof puzzleNumber !== "number" || puzzleNumber < 1) {
    return NextResponse.json({ error: "Invalid puzzleNumber" }, { status: 400 });
  }
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }
  if (typeof completed !== "boolean") {
    return NextResponse.json({ error: "Invalid completed" }, { status: 400 });
  }

  await prisma.gameResult.upsert({
    where: { game_userId_date: { game, userId, date } },
    update: {
      score,
      completed,
      shareText: shareText ?? null,
      streak: streak ?? 0,
      maxStreak: maxStreak ?? 0,
      gameType,
      smgVersion: smgVersion ?? "1.1",
      puzzleNumber,
    },
    create: {
      game,
      gameType,
      userId,
      date,
      puzzleNumber,
      score,
      completed,
      shareText: shareText ?? null,
      streak: streak ?? 0,
      maxStreak: maxStreak ?? 0,
      smgVersion: smgVersion ?? "1.1",
    },
  });

  return NextResponse.json({ saved: true });
}
