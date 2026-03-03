"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

type Plan = "monthly" | "annual";

export default function SubscribePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(plan: Plan) {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/subscribe");
      return;
    }

    setLoading(plan);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (!isLoaded) return null;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div
        className="max-w-3xl mx-auto px-6"
        style={{ paddingTop: "72px", paddingBottom: "80px" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
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
            Subscribe
          </div>
          <h1
            style={{
              fontFamily:   "var(--font-dm-serif)",
              color:        "var(--text)",
              fontSize:     "clamp(1.75rem, 4vw, 2.5rem)",
              lineHeight:   1.15,
              marginBottom: "14px",
            }}
          >
            Start your free trial
          </h1>
          <p
            style={{
              color:     "var(--text-muted)",
              fontSize:  "1rem",
              lineHeight: 1.7,
              maxWidth:  "440px",
              margin:    "0 auto",
            }}
          >
            7 days free — no charge until your trial ends. Cancel any time.
          </p>
        </div>

        {/* Plan cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "20px", marginBottom: "32px" }}
        >
          {/* Annual — recommended */}
          <PlanCard
            name="Annual"
            price="$39.99"
            period="/ year"
            badge="Best value — save 33%"
            perMonth="$3.33 / mo"
            highlighted
            loading={loading === "annual"}
            onSelect={() => handleSubscribe("annual")}
          />

          {/* Monthly */}
          <PlanCard
            name="Monthly"
            price="$4.99"
            period="/ month"
            loading={loading === "monthly"}
            onSelect={() => handleSubscribe("monthly")}
          />
        </div>

        {error && (
          <p
            style={{
              color:        "#e05252",
              fontSize:     "0.875rem",
              textAlign:    "center",
              marginBottom: "20px",
            }}
          >
            {error}
          </p>
        )}

        {/* What's included */}
        <div
          style={{
            background:   "var(--surface)",
            border:       "1px solid var(--border)",
            borderRadius: "14px",
            padding:      "28px 32px",
          }}
        >
          <p
            style={{
              color:        "var(--text-dim)",
              fontWeight:   600,
              fontSize:     "0.8rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Included with every plan
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "Full archive access — play every past puzzle",
              "Ad-free experience",
              "Server-saved stats & streaks",
              "Cross-device sync",
              "Full leaderboard ranking",
              "Support an indie game site",
            ].map((item) => (
              <li key={item} style={{ display: "flex", gap: "10px", alignItems: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p
          style={{
            color:     "var(--text-muted)",
            fontSize:  "0.8rem",
            textAlign: "center",
            marginTop: "24px",
            lineHeight: 1.6,
          }}
        >
          Secure checkout via Stripe. Cancel anytime from your account settings.
        </p>
      </div>
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  name:        string;
  price:       string;
  period:      string;
  badge?:      string;
  perMonth?:   string;
  highlighted?: boolean;
  loading:     boolean;
  onSelect:    () => void;
}

function PlanCard({ name, price, period, badge, perMonth, highlighted, loading, onSelect }: PlanCardProps) {
  return (
    <div
      style={{
        background:   highlighted ? "var(--accent-dim)" : "var(--surface)",
        border:       highlighted ? "2px solid var(--accent)" : "1px solid var(--border)",
        borderRadius: "14px",
        padding:      "28px",
        display:      "flex",
        flexDirection: "column",
        gap:          "16px",
        position:     "relative",
      }}
    >
      {badge && (
        <div
          style={{
            position:      "absolute",
            top:           "-13px",
            left:          "50%",
            transform:     "translateX(-50%)",
            background:    "var(--accent)",
            color:         "#0d0d18",
            fontSize:      "10px",
            fontWeight:    700,
            letterSpacing: "0.08em",
            padding:       "3px 12px",
            borderRadius:  "20px",
            textTransform: "uppercase",
            whiteSpace:    "nowrap",
          }}
        >
          {badge}
        </div>
      )}

      <div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          {name}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ color: "var(--text)", fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-dm-serif)" }}>
            {price}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {period}
          </span>
        </div>
        {perMonth && (
          <p style={{ color: "var(--accent)", fontSize: "0.8rem", marginTop: "4px" }}>
            {perMonth}
          </p>
        )}
      </div>

      <button
        onClick={onSelect}
        disabled={loading}
        style={{
          background:    highlighted ? "var(--accent)" : "var(--surface)",
          color:         highlighted ? "#0d0d18" : "var(--text)",
          border:        highlighted ? "none" : "1px solid var(--border)",
          borderRadius:  "9px",
          padding:       "12px 0",
          fontWeight:    700,
          fontSize:      "0.9rem",
          cursor:        loading ? "not-allowed" : "pointer",
          opacity:       loading ? 0.7 : 1,
          transition:    "opacity 0.15s",
          width:         "100%",
        }}
      >
        {loading ? "Redirecting…" : "Start free trial →"}
      </button>
    </div>
  );
}
