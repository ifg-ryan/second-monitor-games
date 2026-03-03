import { prisma } from "./prisma";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired";

export interface SubscriptionInfo {
  isActive: boolean;       // true when trialing or active
  status: SubscriptionStatus | null;
  planId: string | null;
  trialEnd: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

const ACTIVE_STATUSES: SubscriptionStatus[] = ["trialing", "active"];

/**
 * Returns subscription info for a given Clerk user ID.
 * Always queries the DB — call this from server components or API routes only.
 */
export async function getSubscriptionStatus(clerkId: string): Promise<SubscriptionInfo> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { subscription: true },
  });

  if (!user || !user.subscription) {
    return {
      isActive: false,
      status: null,
      planId: null,
      trialEnd: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  const sub = user.subscription;
  const status = sub.status as SubscriptionStatus;

  return {
    isActive: ACTIVE_STATUSES.includes(status),
    status,
    planId: sub.stripePriceId,
    trialEnd: sub.trialEnd,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
  };
}

/**
 * Convenience: returns true if the user has an active or trialing subscription.
 */
export async function isSubscribed(clerkId: string): Promise<boolean> {
  const info = await getSubscriptionStatus(clerkId);
  return info.isActive;
}
