import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're subscribed — Second Monitor Games",
  robots: { index: false },
};

export default function SubscribeSuccessPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div
        className="max-w-lg mx-auto px-6"
        style={{ paddingTop: "96px", paddingBottom: "80px", textAlign: "center" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "24px" }}>🎉</div>

        <h1
          style={{
            fontFamily:   "var(--font-dm-serif)",
            color:        "var(--text)",
            fontSize:     "clamp(1.75rem, 4vw, 2.25rem)",
            lineHeight:   1.2,
            marginBottom: "16px",
          }}
        >
          You&apos;re in!
        </h1>

        <p
          style={{
            color:        "var(--text-muted)",
            fontSize:     "1rem",
            lineHeight:   1.7,
            marginBottom: "36px",
          }}
        >
          Your 7-day free trial has started. You now have full access to the
          archive, ad-free games, and server-saved stats. We&apos;ll only charge
          you after the trial ends.
        </p>

        <div
          style={{
            background:   "var(--surface)",
            border:       "1px solid var(--border)",
            borderRadius: "12px",
            padding:      "20px 24px",
            marginBottom: "32px",
            textAlign:    "left",
          }}
        >
          <p style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
            What&apos;s unlocked
          </p>
          {[
            ["🗄️", "Full archive", "Every past puzzle, playable now"],
            ["🚫", "No ads", "Clean, distraction-free games"],
            ["📊", "Server stats", "Streaks and history saved across devices"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ color: "var(--text)", fontSize: "0.875rem", fontWeight: 600, marginBottom: "2px" }}>{title}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              background:     "var(--accent)",
              color:          "#0d0d18",
              fontWeight:     700,
              fontSize:       "0.9rem",
              padding:        "12px 28px",
              borderRadius:   "9px",
              textDecoration: "none",
            }}
          >
            Play today&apos;s games →
          </Link>
          <Link
            href="/archive"
            style={{
              background:     "var(--surface)",
              color:          "var(--text)",
              border:         "1px solid var(--border)",
              fontWeight:     600,
              fontSize:       "0.9rem",
              padding:        "12px 28px",
              borderRadius:   "9px",
              textDecoration: "none",
            }}
          >
            Browse the archive
          </Link>
        </div>
      </div>
    </div>
  );
}
