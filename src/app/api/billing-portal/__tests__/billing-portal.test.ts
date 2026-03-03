import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/stripe", () => ({
  default: {
    billingPortal: {
      sessions: { create: vi.fn() },
    },
  },
}));

import { auth }        from "@clerk/nextjs/server";
import { prisma }      from "@/lib/prisma";
import stripeClient    from "@/lib/stripe";
import { POST }        from "../route";

const mockAuth         = vi.mocked(auth);
const mockFindUnique   = vi.mocked(prisma.user.findUnique);
const mockPortalCreate = vi.mocked(stripeClient.billingPortal.sessions.create);

// ── Fixture ───────────────────────────────────────────────────────────────────

const makeRequest = (origin = "https://secondmonitorgames.com") =>
  new Request("http://localhost/api/billing-portal", {
    method:  "POST",
    headers: { origin },
  });

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/billing-portal", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as never);

    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/unauthorized/i);
  });

  it("returns 404 when user has no stripeCustomerId", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_abc" } as never);
    mockFindUnique.mockResolvedValue({ stripeCustomerId: null } as never);

    const res = await POST(makeRequest());
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toMatch(/no billing account/i);
  });

  it("returns 404 when user record does not exist", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_abc" } as never);
    mockFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest());
    expect(res.status).toBe(404);
  });

  it("creates a portal session and returns the URL", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_abc" } as never);
    mockFindUnique.mockResolvedValue({ stripeCustomerId: "cus_test_123" } as never);
    mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/session/xyz" } as never);

    const res = await POST(makeRequest("https://secondmonitorgames.com"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.url).toBe("https://billing.stripe.com/session/xyz");

    expect(mockPortalCreate).toHaveBeenCalledWith({
      customer:   "cus_test_123",
      return_url: "https://secondmonitorgames.com/account",
    });
  });

  it("uses the request origin for return_url", async () => {
    mockAuth.mockResolvedValue({ userId: "clerk_abc" } as never);
    mockFindUnique.mockResolvedValue({ stripeCustomerId: "cus_test_123" } as never);
    mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/session/abc" } as never);

    await POST(makeRequest("https://custom-origin.com"));

    expect(mockPortalCreate).toHaveBeenCalledWith(
      expect.objectContaining({ return_url: "https://custom-origin.com/account" })
    );
  });
});
