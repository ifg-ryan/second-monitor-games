import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "Subscribe — Second Monitor Games",
  description: "Go ad-free and unlock every past puzzle. Subscribe to Second Monitor Games for $4.99/month.",
  alternates:  { canonical: "https://secondmonitorgames.com/pricing" },
  robots:      { index: true, follow: true },
};

const MONTHLY_PRICE = "$4.99";
const ANNUAL_PRICE  = "$39.99";
const ANNUAL_MONTHLY_EQUIV = "$3.33";

const BENEFITS = [
  {
    icon:  "🚫",
    title: "No ads. Ever.",
    body:  "The free tier is ad-supported. Subscribers get a completely clean experience — no banners, no interruptions, nothing between you and the puzzle.",
  },
  {
    icon:  "📅",
    title: "Every past puzzle, forever.",
    body:  "The archive goes back to day one. Play any puzzle you missed, replay your favourites, or catch up on a week you skipped. New puzzles unlock to the archive daily.",
  },
  {
    icon:  "📊",
    title: "Full stats, saved forever.",
    body:  "Free players store stats in their browser — clear your cache, lose your streak. Subscribers have their history, streaks, and leaderboard placement saved to the server.",
  },
  {
    icon:  "🏆",
    title: "Full leaderboard access.",
    body:  "See where you rank against every other player. Daily boards, all-time bests, per-game rankings. Free players can view — subscribers are counted.",
  },
];

const COMPARISON = [
  { feature: "All daily games",          free: true,  sub: true,  freeLabel: "✓",          subLabel: "✓" },
  { feature: "Streak tracking",          free: true,  sub: true,  freeLabel: "Browser only", subLabel: "✓ Server-saved" },
  { feature: "Game stats",               free: true,  sub: true,  freeLabel: "Browser only", subLabel: "✓ Server-saved" },
  { feature: "Leaderboards",             free: "view", sub: true, freeLabel: "View only",   subLabel: "✓ Ranked" },
  { feature: "Archive — past puzzles",   free: false, sub: true,  freeLabel: "🔒 Locked",   subLabel: "✓ All access" },
  { feature: "Ads",                      free: "ads", sub: false, freeLabel: "Ad-supported", subLabel: "🚫 Ad-free" },
  { feature: "Cross-device sync",        free: false, sub: true,  freeLabel: "🔒 Locked",   subLabel: "✓ All devices" },
  { feature: "Support the site",         free: false, sub: true,  freeLabel: "—",           subLabel: "❤️ Thank you" },
];

const FAQS = [
  {
    q: "Can I cancel any time?",
    a: "Yes. Cancel from your account settings and you keep access until the end of your billing period. No questions asked, no cancellation fees.",
  },
  {
    q: "What happens to my streak if I cancel?",
    a: "Your streak and stats stay on the server. If you ever resubscribe, everything is right where you left it.",
  },
  {
    q: "Is there a free trial?",
    a: "The daily game is always free — no trial needed. Try it for as long as you like before subscribing.",
  },
  {
    q: "Do I need an account to subscribe?",
    a: "Yes — a free account is required to subscribe so we can attach your subscription to your profile. Creating one takes about 30 seconds.",
  },
  {
    q: "What is the archive exactly?",
    a: "Every puzzle published since launch, organised by date. You can replay any day's challenge from any game at any time — great for catching up or replaying a puzzle you particularly liked.",
  },
];

export default function PricingPage() {
  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ── Hero — two-column above the fold ──────────────────────── */}
      <section
        style={{
          background:   "linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)",
          borderBottom: "1px solid var(--border)",
          padding:      "64px 32px 72px",
        }}
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-center"
          style={{ maxWidth: "1060px", margin: "0 auto" }}
        >

          {/* ── Left: marketing copy ───────────────────────────────── */}
          <div>
            <div
              style={{
                display:       "inline-block",
                background:    "var(--accent-dim)",
                color:         "var(--accent)",
                fontSize:      "11px",
                fontWeight:    700,
                letterSpacing: "0.12em",
                padding:       "4px 14px",
                borderRadius:  "20px",
                textTransform: "uppercase",
                marginBottom:  "24px",
              }}
            >
              Second Monitor Games Plus
            </div>

            <h1
              style={{
                fontFamily:   "var(--font-dm-serif)",
                color:        "var(--text)",
                fontSize:     "clamp(2rem, 4vw, 3.2rem)",
                lineHeight:   1.1,
                marginBottom: "20px",
              }}
            >
              You play every day.<br />
              <span style={{ color: "var(--accent)" }}>Play better.</span>
            </h1>

            <p
              style={{
                color:        "var(--text-muted)",
                fontSize:     "1.05rem",
                lineHeight:   1.75,
                marginBottom: "32px",
                maxWidth:     "480px",
              }}
            >
              Remove the ads. Unlock every past puzzle. Keep your streak safe on the server.
              All for less than a coffee a month.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "No ads on any game — ever",
                "Full archive — every past puzzle, every game",
                "Stats & streaks saved to the server",
                "Full leaderboard ranking",
                "Cross-device sync",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        "10px",
                    fontSize:   "0.95rem",
                    color:      "var(--text-muted)",
                  }}
                >
                  <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: pricing card ────────────────────────────────── */}
          <div
            style={{
              background:   "var(--surface)",
              border:       "1px solid var(--border)",
              borderRadius: "20px",
              padding:      "36px 32px",
              position:     "relative",
              overflow:     "hidden",
            }}
          >
            {/* Glow */}
            <div
              aria-hidden
              style={{
                position:      "absolute",
                top:           "-50px",
                left:          "50%",
                transform:     "translateX(-50%)",
                width:         "260px",
                height:        "120px",
                background:    "radial-gradient(ellipse, rgba(232,168,56,0.16) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Annual — PRIMARY */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize:      "0.72rem",
                    fontWeight:    700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color:         "var(--text-muted)",
                  }}
                >
                  Annual plan
                </span>
                <span
                  style={{
                    background:    "rgba(83,141,78,0.22)",
                    color:         "#6abf69",
                    fontSize:      "10px",
                    fontWeight:    700,
                    padding:       "3px 8px",
                    borderRadius:  "4px",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  Save 33%
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-dm-serif)",
                    fontSize:   "3.2rem",
                    color:      "var(--accent)",
                    lineHeight: 1,
                  }}
                >
                  {ANNUAL_MONTHLY_EQUIV}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>/ mo</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>
                {ANNUAL_PRICE} billed once per year
              </p>
            </div>

            {/* Annual CTA — hero button */}
            <a
              href="/subscribe?plan=annual"
              style={{
                display:        "block",
                background:     "var(--accent)",
                color:          "#0d0d18",
                fontWeight:     700,
                fontSize:       "1rem",
                padding:        "15px",
                borderRadius:   "10px",
                textDecoration: "none",
                textAlign:      "center",
                transition:     "opacity 0.2s",
                marginBottom:   "16px",
              }}
            >
              Get Annual Plan — {ANNUAL_PRICE}/yr →
            </a>

            {/* Monthly divider + option */}
            <div
              style={{
                borderTop:  "1px solid var(--border)",
                paddingTop: "16px",
                display:    "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Monthly option
              </span>
              <a
                href="/subscribe"
                style={{
                  color:          "var(--text)",
                  fontWeight:     600,
                  fontSize:       "0.9rem",
                  textDecoration: "none",
                  borderBottom:   "1px solid var(--border)",
                  paddingBottom:  "1px",
                }}
              >
                {MONTHLY_PRICE}/mo
              </a>
            </div>

            <p
              style={{
                marginTop: "14px",
                fontSize:  "0.75rem",
                color:     "var(--text-muted)",
                textAlign: "center",
              }}
            >
              Cancel any time · No long-term commitment
            </p>
          </div>

        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2
          style={{
            fontFamily:   "var(--font-dm-serif)",
            color:        "var(--text)",
            fontSize:     "clamp(1.5rem, 3vw, 2.25rem)",
            textAlign:    "center",
            marginBottom: "48px",
          }}
        >
          Everything included
        </h2>
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap:                 "20px",
          }}
        >
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                background:   "var(--surface)",
                border:       "1px solid var(--border)",
                borderRadius: "14px",
                padding:      "28px",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "14px" }}>{b.icon}</div>
              <h3
                style={{
                  color:        "var(--text)",
                  fontSize:     "1rem",
                  fontWeight:   700,
                  marginBottom: "10px",
                }}
              >
                {b.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────────── */}
      <section
        style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2
            style={{
              fontFamily:   "var(--font-dm-serif)",
              color:        "var(--text)",
              fontSize:     "clamp(1.5rem, 3vw, 2rem)",
              textAlign:    "center",
              marginBottom: "40px",
            }}
          >
            Free vs. Subscriber
          </h2>

          <div
            style={{
              background:   "var(--bg)",
              border:       "1px solid var(--border)",
              borderRadius: "14px",
              overflow:     "hidden",
            }}
          >
            {/* Header row */}
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "1fr 160px 160px",
                padding:             "12px 24px",
                borderBottom:        "1px solid var(--border)",
                background:          "var(--surface-2)",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Feature
              </span>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", textAlign: "center" }}>
                Free
              </span>
              <span
                style={{
                  fontSize:      "0.75rem",
                  fontWeight:    700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color:         "var(--accent)",
                  textAlign:     "center",
                }}
              >
                Subscriber
              </span>
            </div>

            {/* Data rows */}
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                style={{
                  display:             "grid",
                  gridTemplateColumns: "1fr 160px 160px",
                  padding:             "14px 24px",
                  borderBottom:        i < COMPARISON.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems:          "center",
                }}
              >
                <span style={{ color: "var(--text)", fontSize: "0.875rem", fontWeight: 500 }}>
                  {row.feature}
                </span>
                <span
                  style={{
                    color:     row.free === false ? "var(--text-muted)" : "var(--text-muted)",
                    fontSize:  "0.82rem",
                    textAlign: "center",
                    opacity:   row.free === false ? 0.5 : 1,
                  }}
                >
                  {row.freeLabel}
                </span>
                <span
                  style={{
                    color:      "var(--accent)",
                    fontSize:   "0.82rem",
                    fontWeight: 600,
                    textAlign:  "center",
                  }}
                >
                  {row.subLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof / mid-page hook ──────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div
          style={{
            borderLeft:  "3px solid var(--accent)",
            paddingLeft: "24px",
            maxWidth:    "560px",
            margin:      "0 auto",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-dm-serif)",
              color:      "var(--text)",
              fontSize:   "clamp(1.25rem, 2.5vw, 1.65rem)",
              lineHeight: 1.5,
              marginBottom: "14px",
            }}
          >
            &ldquo;The whole point is you keep it open on your second monitor.
            Subscribing just makes it better — no ads to dodge between the puzzle and your work.&rdquo;
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            The Second Monitor Games philosophy — quick, distraction-free, every day.
          </p>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section
        style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2
            style={{
              fontFamily:   "var(--font-dm-serif)",
              color:        "var(--text)",
              fontSize:     "clamp(1.5rem, 3vw, 2rem)",
              marginBottom: "40px",
            }}
          >
            Questions
          </h2>
          <div className="flex flex-col" style={{ gap: "28px" }}>
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <h3
                  style={{
                    color:        "var(--text)",
                    fontSize:     "0.975rem",
                    fontWeight:   700,
                    marginBottom: "8px",
                  }}
                >
                  {q}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.75, margin: 0 }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div
          style={{
            background:   "var(--surface)",
            border:       "1px solid var(--border)",
            borderRadius: "20px",
            padding:      "clamp(32px, 5vw, 60px)",
            textAlign:    "center",
            position:     "relative",
            overflow:     "hidden",
          }}
        >
          {/* Subtle accent glow */}
          <div
            aria-hidden
            style={{
              position:      "absolute",
              bottom:        "-40px",
              left:          "50%",
              transform:     "translateX(-50%)",
              width:         "300px",
              height:        "120px",
              background:    "radial-gradient(ellipse, rgba(232,168,56,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🃏</div>

          <h2
            style={{
              fontFamily:   "var(--font-dm-serif)",
              color:        "var(--text)",
              fontSize:     "clamp(1.5rem, 3vw, 2.25rem)",
              marginBottom: "14px",
              lineHeight:   1.2,
            }}
          >
            Ready to go ad-free?
          </h2>
          <p
            style={{
              color:        "var(--text-muted)",
              fontSize:     "0.95rem",
              lineHeight:   1.7,
              marginBottom: "32px",
              maxWidth:     "400px",
              margin:       "0 auto 32px",
            }}
          >
            Join the players who already have a cleaner, better Second Monitor Games.
            Cancel any time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center" style={{ gap: "12px" }}>
            <a
              href="/subscribe?plan=annual"
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            "8px",
                background:     "var(--accent)",
                color:          "#0d0d18",
                fontWeight:     700,
                fontSize:       "1rem",
                padding:        "15px 36px",
                borderRadius:   "10px",
                textDecoration: "none",
                transition:     "opacity 0.2s",
                whiteSpace:     "nowrap",
              }}
            >
              Get Annual Plan — {ANNUAL_PRICE}/yr →
            </a>
            <a
              href="/"
              style={{
                color:          "var(--text-muted)",
                fontSize:       "0.875rem",
                textDecoration: "none",
              }}
            >
              Keep playing for free
            </a>
          </div>

          <p style={{ marginTop: "18px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Or go month-to-month —{" "}
            <a href="/subscribe" style={{ color: "var(--accent)", textDecoration: "none" }}>
              {MONTHLY_PRICE}/mo
            </a>
            . Cancel any time.
          </p>
        </div>
      </section>

    </div>
  );
}
