import { describe, it, expect, vi } from "vitest";

// Mock heavy server-only modules so the pure helper can be tested in isolation
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("@/lib/subscription",   () => ({ isSubscribed: vi.fn() }));
vi.mock("@/lib/prisma",         () => ({ default: {} }));

import { getArchivePastHref } from "../page";

describe("getArchivePastHref", () => {
  const gameHref = "/games/decode";
  const dateStr  = "2026-02-15";

  it("returns /subscribe for a non-subscriber", () => {
    expect(getArchivePastHref(gameHref, dateStr, false)).toBe("/subscribe");
  });

  it("returns /subscribe for a non-subscriber regardless of date", () => {
    expect(getArchivePastHref(gameHref, "2026-01-01", false)).toBe("/subscribe");
    expect(getArchivePastHref(gameHref, "2025-12-31", false)).toBe("/subscribe");
  });

  it("returns a date-parameterised game link for a subscriber", () => {
    expect(getArchivePastHref(gameHref, dateStr, true)).toBe(
      "/games/decode?date=2026-02-15"
    );
  });

  it("uses the correct game href for different games", () => {
    expect(getArchivePastHref("/games/the-escape", dateStr, true)).toBe(
      "/games/the-escape?date=2026-02-15"
    );
    expect(getArchivePastHref("/games/block-fall", dateStr, true)).toBe(
      "/games/block-fall?date=2026-02-15"
    );
  });

  it("preserves the exact date string in the URL param", () => {
    const result = getArchivePastHref(gameHref, "2026-03-01", true);
    expect(result).toBe("/games/decode?date=2026-03-01");
    const url = new URL(result, "https://example.com");
    expect(url.searchParams.get("date")).toBe("2026-03-01");
  });
});
