import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user:         { upsert: vi.fn() },
    subscription: { upsert: vi.fn(), updateMany: vi.fn() },
  },
}));

vi.mock("@/lib/stripe", () => ({
  default: {
    webhooks:      { constructEvent: vi.fn() },
    customers:     { retrieve: vi.fn() },
    subscriptions: { retrieve: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import stripeClient from "@/lib/stripe";
import { POST } from "../route";

const mockConstructEvent  = vi.mocked(stripeClient.webhooks.constructEvent);
const mockRetrieveSub     = vi.mocked(stripeClient.subscriptions.retrieve);
const mockRetrieveCust    = vi.mocked(stripeClient.customers.retrieve);
const mockUserUpsert      = vi.mocked(prisma.user.upsert);
const mockSubUpsert       = vi.mocked(prisma.subscription.upsert);
const mockSubUpdateMany   = vi.mocked(prisma.subscription.updateMany);

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeSub = (overrides = {}) => ({
  id:                   "sub_test_123",
  status:               "trialing",
  customer:             "cus_test_456",
  current_period_end:   1780000000,
  trial_end:            1780000000,
  cancel_at_period_end: false,
  metadata:             { clerkId: "clerk_abc" },
  items:                { data: [{ price: { id: "price_monthly" } }] },
  ...overrides,
});

const makeRequest = (body: string, sig = "valid-sig") =>
  new Request("http://localhost/api/webhooks/stripe", {
    method:  "POST",
    headers: { "stripe-signature": sig },
    body,
  });

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";

  mockRetrieveCust.mockResolvedValue({
    deleted: false,
    email:   "test@example.com",
  } as never);

  mockUserUpsert.mockResolvedValue({ id: "db_user_1" } as never);
  mockSubUpsert.mockResolvedValue({} as never);
  mockSubUpdateMany.mockResolvedValue({ count: 1 } as never);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/webhooks/stripe", () => {
  it("returns 400 if stripe-signature header is missing", async () => {
    const req = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body:   "{}",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/missing stripe-signature/i);
  });

  it("returns 400 if signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No matching webhook signature");
    });
    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/invalid signature/i);
  });

  describe("checkout.session.completed", () => {
    it("upserts user and subscription on completed checkout", async () => {
      const sub = makeSub();
      mockRetrieveSub.mockResolvedValue(sub as never);
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            mode:         "subscription",
            subscription: "sub_test_123",
            metadata:     { clerkId: "clerk_abc" },
          },
        },
      } as never);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockRetrieveSub).toHaveBeenCalledWith("sub_test_123");
      expect(mockUserUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clerkId: "clerk_abc" } })
      );
      expect(mockSubUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripeSubscriptionId: "sub_test_123" },
        })
      );
    });

    it("ignores non-subscription checkout sessions", async () => {
      mockConstructEvent.mockReturnValue({
        type: "checkout.session.completed",
        data: { object: { mode: "payment", subscription: null } },
      } as never);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockSubUpsert).not.toHaveBeenCalled();
    });
  });

  describe("customer.subscription.updated", () => {
    it("upserts subscription on update", async () => {
      const sub = makeSub({ status: "active" });
      mockConstructEvent.mockReturnValue({
        type: "customer.subscription.updated",
        data: { object: sub },
      } as never);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockSubUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where:  { stripeSubscriptionId: "sub_test_123" },
          update: expect.objectContaining({ status: "active" }),
        })
      );
    });

    it("does not upsert when clerkId metadata is missing", async () => {
      const sub = makeSub({ metadata: {} });
      mockConstructEvent.mockReturnValue({
        type: "customer.subscription.updated",
        data: { object: sub },
      } as never);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockSubUpsert).not.toHaveBeenCalled();
    });
  });

  describe("customer.subscription.deleted", () => {
    it("marks subscription as canceled on delete", async () => {
      mockConstructEvent.mockReturnValue({
        type: "customer.subscription.deleted",
        data: { object: makeSub({ status: "canceled" }) },
      } as never);

      const res = await POST(makeRequest("{}"));
      expect(res.status).toBe(200);
      expect(mockSubUpdateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: "sub_test_123" },
        data:  { status: "canceled" },
      });
    });
  });

  it("returns 200 for unhandled event types", async () => {
    mockConstructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: { object: {} },
    } as never);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });
});
