import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const PRICE_IDS: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  annual:  process.env.STRIPE_PRICE_ANNUAL!,
};

const TRIAL_DAYS = 7;

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Validate plan ─────────────────────────────────────────────────────────
  const body = await request.json().catch(() => ({}));
  const plan = body.plan as string;
  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan. Use 'monthly' or 'annual'." }, { status: 400 });
  }

  // ── Get user email from Clerk ──────────────────────────────────────────────
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? undefined;

  // ── Find or create Stripe customer ────────────────────────────────────────
  let stripeCustomerId: string | undefined;

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { stripeCustomerId: true },
  });

  if (existingUser?.stripeCustomerId) {
    stripeCustomerId = existingUser.stripeCustomerId;
  } else if (email) {
    // Check if a Stripe customer already exists with this email
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      stripeCustomerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { clerkId: userId },
      });
      stripeCustomerId = customer.id;
    }

    // Persist stripeCustomerId to our DB (upsert User record)
    await prisma.user.upsert({
      where:  { clerkId: userId },
      create: { clerkId: userId, email: email!, stripeCustomerId },
      update: { stripeCustomerId },
    });
  }

  // ── Create Stripe Checkout session ────────────────────────────────────────
  const origin = request.headers.get("origin") ?? "https://secondmonitorgames.com";

  const session = await stripe.checkout.sessions.create({
    mode:                 "subscription",
    customer:             stripeCustomerId,
    customer_email:       stripeCustomerId ? undefined : email,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata:          { clerkId: userId },
    },
    metadata: { clerkId: userId },
    success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
