import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { deleteAccountData, upsertUser } from "@/lib/accounts";

// Clerk sends webhooks signed via svix — verify before trusting
interface ClerkUserCreatedEvent {
  type: "user.created";
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    primary_email_address_id: string;
  };
}

type ClerkEvent = ClerkUserCreatedEvent | { type: string; data: unknown };

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Read raw body + svix headers
  const body = await request.text();
  const headersList = await headers();
  const svixId        = headersList.get("svix-id")        ?? "";
  const svixTimestamp = headersList.get("svix-timestamp") ?? "";
  const svixSignature = headersList.get("svix-signature") ?? "";

  // Verify signature
  let event: ClerkEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("[clerk-webhook] Signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Account deleted in Clerk (by the player or from the Clerk dashboard): remove the site's data too.
  if (event.type === "user.deleted") {
    const id = (event.data as { id?: string }).id;
    if (id) {
      try {
        await deleteAccountData(id);
      } catch (err) {
        console.error("[clerk-webhook] delete failed", err);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
    }
    return NextResponse.json({ received: true });
  }

  // Otherwise only user.created
  if (event.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  const userEvent = event as ClerkUserCreatedEvent;
  const { id: clerkId, email_addresses, primary_email_address_id } = userEvent.data;

  // Resolve primary email
  const primaryEmail = email_addresses.find(
    (e: { id: string; email_address: string }) => e.id === primary_email_address_id,
  )?.email_address ?? email_addresses[0]?.email_address;

  if (!clerkId || !primaryEmail) {
    console.error("[clerk-webhook] Missing clerkId or email", { clerkId, primaryEmail });
    return NextResponse.json({ error: "Missing user data" }, { status: 422 });
  }

  // Create user in DB (idempotent — ignore if already exists)
  try {
    await upsertUser(clerkId, primaryEmail);
    console.log(`[clerk-webhook] User created: ${clerkId} <${primaryEmail}>`);
  } catch (err) {
    console.error("[clerk-webhook] DB upsert failed", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
