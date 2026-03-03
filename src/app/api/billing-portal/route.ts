import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import stripeClient from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const ALLOWED_ORIGINS = [
  "https://secondmonitorgames.com",
  "http://localhost:3000",
];

function safeOrigin(request: Request): string {
  const raw = request.headers.get("origin") ?? "";
  return ALLOWED_ORIGINS.includes(raw) ? raw : "https://secondmonitorgames.com";
}

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Find Stripe customer ───────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where:  { clerkId: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found. Please subscribe first." },
      { status: 404 }
    );
  }

  // ── Create Stripe Customer Portal session ─────────────────────────────────
  const origin = safeOrigin(request);

  const session = await stripeClient.billingPortal.sessions.create({
    customer:   user.stripeCustomerId,
    return_url: `${origin}/account`,
  });

  return NextResponse.json({ url: session.url });
}
