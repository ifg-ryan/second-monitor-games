import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { containsBadWord } from "@/lib/wordFilter";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";

  // Format validation
  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–20 characters: letters, numbers, and underscores only." },
      { status: 422 },
    );
  }

  // Word filter
  if (containsBadWord(username)) {
    return NextResponse.json(
      { error: "That username isn't allowed. Please choose a different one." },
      { status: 422 },
    );
  }

  try {
    // upsert: create the user record if the Clerk webhook hasn't fired yet
    const updated = await prisma.user.upsert({
      where:  { clerkId: userId },
      create: { clerkId: userId, email: `${userId}@placeholder`, username },
      update: { username },
      select: { username: true },
    });
    return NextResponse.json({ username: updated.username });
  } catch (err: unknown) {
    // P2002 = unique constraint violation (username taken)
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
