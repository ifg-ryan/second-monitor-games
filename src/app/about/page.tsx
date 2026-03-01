import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "About — Daily Card Games & Puzzles for Your Second Monitor",
  description: "Second Monitor Games is a free daily game site with card games, strategy puzzles, and quick brain challenges designed for work breaks. New games every day — no subscription.",
  alternates:  { canonical: "https://secondmonitorgames.com/about" },
  openGraph: {
    title:       "About Second Monitor Games",
    description: "Daily card games and quick puzzles for your second monitor. Built for work breaks — free to play, no subscription needed.",
    url:         "https://secondmonitorgames.com/about",
    type:        "website",
  },
};

const FAQ = [
  {
    q: "What is Second Monitor Games?",
    a: "Second Monitor Games is a free daily game site with card games, strategy puzzles, and quick brain challenges. It's built for people who want a short mental break during their workday — games that take 2–5 minutes and reset every day.",
  },
  {
    q: "Is Second Monitor Games free to play?",
    a: "Yes. Every game is free to play every day. A subscription ($4.99/month) removes ads and unlocks the full archive of past puzzles, but the daily game is always free — no credit card needed.",
  },
  {
    q: "What kind of card games are available?",
    a: "The Escape is a unique daily card strategy game — not a standard solitaire clone. You manage a hand of cards, reveal anchors, and must escape before your turns run out. The layout and challenge change every day.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account needed. Play any game instantly without signing up. Your streak, stats, and progress are saved locally in your browser.",
  },
  {
    q: "How long do the games take?",
    a: "Most games take 2–5 minutes — designed to fit into a work break, a gap between meetings, or a quick coffee. None require long sessions or carry-over commitment.",
  },
  {
    q: "Do the challenges reset every day?",
    a: "Yes. Every game resets at midnight UTC. All players worldwide get the same challenge each day — which makes it easy to compare results with coworkers or friends.",
  },
  {
    q: "What makes Second Monitor Games different from other puzzle sites?",
    a: "Most puzzle game sites focus on one game type. Second Monitor Games is built around a use-case — quick, engaging challenges you keep on your second screen during the workday. The games are designed to be fast, satisfying, and daily.",
  },
  {
    q: "What games are available right now?",
    a: "Currently: The Escape (daily card strategy), Decode (daily word puzzle), and Tetris (daily arcade). New games are added regularly — the site is actively growing.",
  },
  {
    q: "Can I play on my phone?",
    a: "The site is optimized for desktop — it's designed for a second monitor, not a small screen. Decode works reasonably well on mobile. Card and arcade games are better on a laptop or desktop.",
  },
  {
    q: "Are there free games to play at work during a break?",
    a: "Yes — that's exactly what Second Monitor Games is built for. Short, satisfying daily challenges you can play in a few minutes without losing focus on your actual work.",
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context":    "https://schema.org",
    "@type":       "FAQPage",
    "mainEntity":  FAQ.map(({ q, a }) => ({
      "@type":          "Question",
      "name":           q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text":  a,
      },
    })),
  };

  return (
    <div style={{ background: "var(--bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10">
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
          About
        </div>
        <h1
          style={{
            fontFamily: "var(--font-dm-serif)",
            color:      "var(--text)",
            fontSize:   "clamp(2rem, 5vw, 3.25rem)",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          Card games and puzzles for your second monitor.
        </h1>
        <p
          style={{
            color:      "var(--text-muted)",
            fontSize:   "1.15rem",
            lineHeight: 1.7,
            maxWidth:   "600px",
          }}
        >
          Second Monitor Games is a free daily game site with card games,
          strategy puzzles, and quick brain challenges. New games every day —
          no subscription, no paywall, no account required to play.
        </p>
      </section>

      {/* ── The second monitor idea ───────────────────────────── */}
      <section
        style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2
              style={{
                fontFamily:   "var(--font-dm-serif)",
                color:        "var(--text)",
                fontSize:     "1.75rem",
                marginBottom: "16px",
              }}
            >
              Built for your second monitor
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.75, marginBottom: "14px" }}>
              Most people have a second monitor. Most people also need a two-minute
              break from their actual work. Second Monitor Games fills that gap —
              quick daily puzzles designed to give your brain a reset without sucking
              you into a doom-scroll.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.75 }}>
              Every game takes under five minutes. Every puzzle resets at midnight.
              You can close the tab and come back tomorrow without losing your streak.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { emoji: "⏱️", label: "2–5 minutes", desc: "Every game is designed to be completable in a short break." },
              { emoji: "📅", label: "Resets every day", desc: "Fresh puzzles at midnight UTC. Same puzzle for every player." },
              { emoji: "🔥", label: "Streak tracking", desc: "Play daily to build a streak. Your stats are saved in your browser." },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display:      "flex",
                  gap:          "16px",
                  alignItems:   "flex-start",
                  background:   "var(--surface)",
                  border:       "1px solid var(--border)",
                  borderRadius: "12px",
                  padding:      "16px",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>{item.emoji}</span>
                <div>
                  <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem", marginBottom: "4px" }}>
                    {item.label}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Games ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2
          style={{
            fontFamily:   "var(--font-dm-serif)",
            color:        "var(--text)",
            fontSize:     "1.75rem",
            marginBottom: "32px",
          }}
        >
          Today&apos;s games
        </h2>
        <div className="flex flex-col gap-5">
          {[
            {
              icon:        "🃏",
              name:        "The Escape",
              type:        "Daily Card Strategy Game",
              color:       "#c9a84c",
              href:        "/games/the-escape",
              description: "A unique daily card strategy game — not your standard solitaire. Reveal anchors, manage your hand, and escape before your turns run out. The configuration changes every day, every player gets the same challenge. Takes about 5 minutes.",
            },
            {
              icon:        "🟩",
              name:        "Decode",
              type:        "Daily Word Puzzle",
              color:       "#538d4e",
              href:        "/games/decode",
              description: "A quick daily word puzzle. Six attempts to find the hidden word — takes under 2 minutes. Green means right letter, right spot. Yellow means right letter, wrong spot. Grey means not in the word. New puzzle every day at midnight, same word for every player worldwide.",
            },
            {
              icon:        "🟦",
              name:        "Tetris",
              type:        "Quick Arcade Game",
              color:       "#00c8ff",
              href:        "/games/tetris",
              description: "The classic block-stacking game, free in your browser. Clear lines, beat your daily high score, see how long you can survive. No download needed — just open and play. Daily leaderboard resets at midnight.",
            },
          ].map((game) => (
            <div
              key={game.name}
              style={{
                display:      "flex",
                gap:          "20px",
                background:   "var(--surface)",
                border:       "1px solid var(--border)",
                borderRadius: "16px",
                padding:      "24px",
                alignItems:   "flex-start",
              }}
            >
              <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>{game.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: "8px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-dm-serif)",
                      color:      "var(--text)",
                      fontSize:   "1.25rem",
                      margin:     0,
                    }}
                  >
                    {game.name}
                  </h3>
                  <span
                    style={{
                      background:    `${game.color}18`,
                      color:         game.color,
                      fontSize:      "10px",
                      fontWeight:    700,
                      letterSpacing: "0.1em",
                      padding:       "3px 8px",
                      borderRadius:  "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {game.type}
                  </span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65, margin: "0 0 14px" }}>
                  {game.description}
                </p>
                <a
                  href={game.href}
                  style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    gap:            "6px",
                    background:     game.color,
                    color:          "#0d0d18",
                    fontWeight:     700,
                    fontSize:       "0.8rem",
                    padding:        "8px 18px",
                    borderRadius:   "7px",
                    textDecoration: "none",
                  }}
                >
                  Play today&apos;s game →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section
        style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h2
            style={{
              fontFamily:   "var(--font-dm-serif)",
              color:        "var(--text)",
              fontSize:     "1.75rem",
              marginBottom: "36px",
            }}
          >
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-8">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <h3
                  style={{
                    color:        "var(--text)",
                    fontSize:     "1rem",
                    fontWeight:   600,
                    marginBottom: "8px",
                  }}
                >
                  {q}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div
          style={{
            background:    "var(--surface)",
            border:        "1px solid var(--border)",
            borderRadius:  "16px",
            padding:       "48px",
            textAlign:     "center",
          }}
        >
          <h2
            style={{
              fontFamily:   "var(--font-dm-serif)",
              color:        "var(--text)",
              fontSize:     "1.75rem",
              marginBottom: "12px",
            }}
          >
            Ready to play?
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "0.95rem" }}>
            Today&apos;s puzzles are live. Free to play — no account needed.
          </p>
          <a
            href="/"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            "8px",
              background:     "var(--accent)",
              color:          "#0d0d18",
              fontWeight:     700,
              fontSize:       "1rem",
              padding:        "14px 36px",
              borderRadius:   "10px",
              textDecoration: "none",
            }}
          >
            See today&apos;s games →
          </a>
        </div>
      </section>
    </div>
  );
}
