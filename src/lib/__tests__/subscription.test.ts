import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSubscriptionStatus, isSubscribed } from "../subscription";

// Mock prisma so tests never hit the real database
vi.mock("../prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "../prisma";

const mockFindUnique = vi.mocked(prisma.user.findUnique);

const makeUser = (subOverrides?: Record<string, unknown> | null) => ({
  id: "user_1",
  clerkId: "clerk_abc",
  email: "test@example.com",
  stripeCustomerId: "cus_test",
  createdAt: new Date(),
  updatedAt: new Date(),
  subscription: subOverrides === null ? null : {
    id: "sub_1",
    userId: "user_1",
    stripeSubscriptionId: "sub_stripe_1",
    stripePriceId: "price_monthly",
    status: "active",
    currentPeriodEnd: new Date("2026-04-02"),
    trialEnd: null,
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...subOverrides,
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSubscriptionStatus", () => {
  it("returns isActive=false when user does not exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getSubscriptionStatus("clerk_unknown");
    expect(result.isActive).toBe(false);
    expect(result.status).toBeNull();
  });

  it("returns isActive=false when user has no subscription", async () => {
    mockFindUnique.mockResolvedValue(makeUser(null) as never);
    const result = await getSubscriptionStatus("clerk_abc");
    expect(result.isActive).toBe(false);
    expect(result.status).toBeNull();
  });

  it("returns isActive=true for active subscription", async () => {
    mockFindUnique.mockResolvedValue(makeUser({ status: "active" }) as never);
    const result = await getSubscriptionStatus("clerk_abc");
    expect(result.isActive).toBe(true);
    expect(result.status).toBe("active");
  });

  it("returns isActive=true for trialing subscription", async () => {
    const trialEnd = new Date("2026-03-09");
    mockFindUnique.mockResolvedValue(
      makeUser({ status: "trialing", trialEnd }) as never
    );
    const result = await getSubscriptionStatus("clerk_abc");
    expect(result.isActive).toBe(true);
    expect(result.status).toBe("trialing");
    expect(result.trialEnd).toEqual(trialEnd);
  });

  it("returns isActive=false for canceled subscription", async () => {
    mockFindUnique.mockResolvedValue(makeUser({ status: "canceled" }) as never);
    const result = await getSubscriptionStatus("clerk_abc");
    expect(result.isActive).toBe(false);
    expect(result.status).toBe("canceled");
  });

  it("returns isActive=false for past_due subscription", async () => {
    mockFindUnique.mockResolvedValue(makeUser({ status: "past_due" }) as never);
    const result = await getSubscriptionStatus("clerk_abc");
    expect(result.isActive).toBe(false);
  });

  it("returns cancelAtPeriodEnd correctly", async () => {
    mockFindUnique.mockResolvedValue(
      makeUser({ status: "active", cancelAtPeriodEnd: true }) as never
    );
    const result = await getSubscriptionStatus("clerk_abc");
    expect(result.isActive).toBe(true);
    expect(result.cancelAtPeriodEnd).toBe(true);
  });

  it("returns the correct planId", async () => {
    mockFindUnique.mockResolvedValue(
      makeUser({ stripePriceId: "price_1T6hJ0DYurxRRoYJBKIJ9Acp" }) as never
    );
    const result = await getSubscriptionStatus("clerk_abc");
    expect(result.planId).toBe("price_1T6hJ0DYurxRRoYJBKIJ9Acp");
  });
});

describe("isSubscribed", () => {
  it("returns true for active user", async () => {
    mockFindUnique.mockResolvedValue(makeUser({ status: "active" }) as never);
    expect(await isSubscribed("clerk_abc")).toBe(true);
  });

  it("returns true for trialing user", async () => {
    mockFindUnique.mockResolvedValue(makeUser({ status: "trialing" }) as never);
    expect(await isSubscribed("clerk_abc")).toBe(true);
  });

  it("returns false for no subscription", async () => {
    mockFindUnique.mockResolvedValue(makeUser(null) as never);
    expect(await isSubscribed("clerk_abc")).toBe(false);
  });

  it("returns false for canceled subscription", async () => {
    mockFindUnique.mockResolvedValue(makeUser({ status: "canceled" }) as never);
    expect(await isSubscribed("clerk_abc")).toBe(false);
  });
});
