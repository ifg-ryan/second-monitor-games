import { NextResponse } from "next/server";
import type Stripe from "stripe";
import stripeClient from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDate(value: number | null | undefined): Date | null {
  return value ? new Date(value * 1000) : null;
}

/**
 * Upsert User + Subscription from a Stripe Subscription object.
 * clerkId must be present in subscription.metadata.
 */
async function upsertSubscription(subscription: Stripe.Subscription) {
  const clerkId = subscription.metadata?.clerkId;
  if (!clerkId) {
    console.error("[webhook] Subscription missing clerkId metadata", subscription.id);
    return;
  }

  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;

  // Resolve customer email
  let email: string | undefined;
  try {
    const customer = await stripeClient.customers.retrieve(customerId);
    if (!customer.deleted) email = customer.email ?? undefined;
  } catch {
    // non-fatal — email is best-effort
  }

  // Upsert User
  const user = await prisma.user.upsert({
    where:  { clerkId },
    create: { clerkId, email: email ?? `${clerkId}@unknown`, stripeCustomerId: customerId },
    update: { stripeCustomerId: customerId, ...(email ? { email } : {}) },
  });

  const priceId = subscription.items.data[0]?.price.id ?? "";
  const currentPeriodEnd = toDate(subscription.items.data[0]?.current_period_end)!;
  const trialEnd = toDate(subscription.trial_end);

  // Upsert Subscription
  await prisma.subscription.upsert({
    where:  { stripeSubscriptionId: subscription.id },
    create: {
      userId:               user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId:        priceId,
      status:               subscription.status,
      currentPeriodEnd,
      trialEnd,
      cancelAtPeriodEnd:    subscription.cancel_at_period_end,
    },
    update: {
      stripePriceId:     priceId,
      status:            subscription.status,
      currentPeriodEnd,
      trialEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig  = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // Checkout completed — subscription is now live (possibly in trial)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

        const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
        await upsertSubscription(subscription);
        break;
      }

      // Subscription changed — status, period, trial, cancellation flag
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscription(subscription);
        break;
      }

      // Subscription ended
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data:  { status: "canceled" },
        });
        break;
      }

      default:
        // Unhandled event types — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error(`[webhook] Error handling event ${event.type}`, err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
