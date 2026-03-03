import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSubscriptionStatus } from "@/lib/subscription";

export const metadata: Metadata = {
  title:   "Account — Second Monitor Games",
  robots:  { index: false, follow: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year:     "numeric",
    month:    "long",
    day:      "numeric",
    timeZone: "UTC",
  });
}

function planLabel(planId: string | null): string {
  if (!planId) return "Unknown";
  // Match our known price IDs; fall back to a generic label
  if (planId === process.env.STRIPE_PRICE_ANNUAL)  return "Annual ($39.99/yr)";
  if (planId === process.env.STRIPE_PRICE_MONTHLY) return "Monthly ($4.99/mo)";
  return "Subscriber";
}

function statusBadge(status: string | null, cancelAtPeriodEnd: boolean) {
  if (!status) return { label: "None", color: "var(--text-muted)" };

  if (status === "trialing")  return { label: "Trial",  color: "#c9a84c" };
  if (status === "active" && cancelAtPeriodEnd)
    return { label: "Cancels at period end", color: "#c9a84c" };
  if (status === "active")    return { label: "Active", color: "var(--accent)" };
  if (status === "past_due")  return { label: "Past due — update payment", color: "#e05252" };
  if (status === "canceled")  return { label: "Canceled", color: "#e05252" };
  return { label: status, color: "var(--text-muted)" };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/account");

  const sub = await getSubscriptionStatus(userId);
  const { label: badgeLabel, color: badgeColor } = statusBadge(sub.status, sub.cancelAtPeriodEnd);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div
        className="max-w-2xl mx-auto px-6"
        style={{ paddingTop: "72px", paddingBottom: "80px" }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display:       "inline-block",
              background:    "var(--accent-dim)",
              color:         "var(--accent)",
              fontSize:      "11px",
              fontWeight:    700,
              letterSpacing: "0.12em",
              padding:       "4px 12px",
              borderRadius:  "4px",
              textTransform: "uppercase",
              marginBottom:  "20px",
            }}
          >
            Account
          </div>
          <h1
            style={{
              fontFamily:   "var(--font-dm-serif)",
              color:        "var(--text)",
              fontSize:     "clamp(1.75rem, 4vw, 2.25rem)",
              lineHeight:   1.15,
            }}
          >
            Your subscription
          </h1>
        </div>

        {/* ── Subscription card ──────────────────────────────────── */}
        <div
          style={{
            background:   "var(--surface)",
            border:       "1px solid var(--border)",
            borderRadius: "16px",
            padding:      "32px",
            marginBottom: "24px",
          }}
        >
          {sub.isActive ? (
            <>
              {/* Status row */}
              <div
                style={{
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "space-between",
                  flexWrap:        "wrap",
                  gap:             "12px",
                  marginBottom:    "28px",
                  paddingBottom:   "24px",
                  borderBottom:    "1px solid var(--border)",
                }}
              >
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                    Plan
                  </p>
                  <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "1rem" }}>
                    {planLabel(sub.planId)}
                  </p>
                </div>
                <div
                  style={{
                    background:    `${badgeColor}18`,
                    color:         badgeColor,
                    fontSize:      "0.8rem",
                    fontWeight:    700,
                    padding:       "5px 14px",
                    borderRadius:  "20px",
                    whiteSpace:    "nowrap",
                  }}
                >
                  {badgeLabel}
                </div>
              </div>

              {/* Detail rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {sub.trialEnd && sub.status === "trialing" && (
                  <DetailRow
                    label="Trial ends"
                    value={formatDate(sub.trialEnd)}
                    note="You won't be charged until your trial ends."
                  />
                )}
                <DetailRow
                  label={sub.cancelAtPeriodEnd ? "Access until" : "Next billing date"}
                  value={formatDate(sub.currentPeriodEnd)}
                />
              </div>

              {/* Manage button */}
              <ManageButton />
            </>
          ) : (
            /* No active subscription */
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔓</div>
              <h2
                style={{
                  fontFamily:   "var(--font-dm-serif)",
                  color:        "var(--text)",
                  fontSize:     "1.25rem",
                  marginBottom: "10px",
                }}
              >
                No active subscription
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "24px" }}>
                Subscribe to unlock the full puzzle archive and go ad-free.
              </p>
              <a
                href="/subscribe"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            "8px",
                  background:     "var(--accent)",
                  color:          "#0d0d18",
                  fontWeight:     700,
                  fontSize:       "0.9rem",
                  padding:        "12px 28px",
                  borderRadius:   "9px",
                  textDecoration: "none",
                }}
              >
                Start free trial →
              </a>
            </div>
          )}
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", lineHeight: 1.6 }}>
          Billing is handled securely by Stripe. Cancel anytime — your access continues until the end of your billing period.
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
        {label}
      </p>
      <p style={{ color: "var(--text)", fontSize: "0.95rem", fontWeight: 500 }}>
        {value}
      </p>
      {note && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "3px" }}>
          {note}
        </p>
      )}
    </div>
  );
}

// Client component for the Manage Subscription button
// (needs to call the API and redirect — small island of interactivity)
import ManageButton from "./ManageButton";
