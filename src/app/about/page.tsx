import type { Metadata } from "next";

export const metadata: Metadata = {
  title:       "About — Free Daily Puzzle Games for Your Second Monitor",
  description: "Second Monitor Games is a free daily puzzle game site. New word puzzles, brain games, and strategy challenges every day — no subscription, no paywall.",
  alternates:  { canonical: "https://secondmonitorgames.com/about" },
  openGraph: {
    title:       "About Second Monitor Games",
    description: "Free daily puzzle games for your second monitor. New challenges every day — no subscription needed.",
    url:         "https://secondmonitorgames.com/about",
    type:        "website",
  },
};

const FAQ = [
  {
    q: "What is Second Monitor Games?",
    a: "Second Monitor Games is a free website with daily puzzle games — word puzzles, brain games, and strategy challenges that reset every day. It's built for people who want a quick mental challenge during their workday, without paying a subscription.",
  },
  {
    q: "Is Second Monitor Games free to play?",
    a: "Yes. Every game on Second Monitor Games is free to play. A subscription ($4.99/month) removes ads and unlocks the full archive of past puzzles, but the daily game is always free.",
  },
  {
    q: "How is Decode different from Wordle?",
    a: "Decode is a free daily five-letter word puzzle similar to Wordle. Unlike the NYT version, Decode never moves behind a paywall, tracks your streak locally without requiring an account, and is part of a broader site with multiple daily games.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. You can play every game on Second Monitor Games without signing up. Your streak and stats are saved locally in your browser. Creating an account lets you save progress across devices.",
  },
  {
    q: "Do the puzzles reset every day?",
    a: "Yes. Every game resets at midnight UTC. All players worldwide get the same puzzle each day — making it easy to compare scores and talk about the answer.",
  },
  {
    q: "What types of puzzle games are available?",
    a: "Second Monitor Games currently offers Decode (a daily word puzzle), The Escape (a daily card strategy puzzle), and Tetris (a classic block puzzle arcade game). New games are added regularly.",
  },
  {
    q: "Can I play on my phone?",
    a: "The games are designed for desktop and work best on a laptop or monitor. Mobile support varies by game — Decode works well on mobile, while strategy and arcade games are optimized for larger screens.",
  },
  {
    q: "What does 'second monitor' mean?",
    a: "Second Monitor Games is designed for the screen you have open alongside your work — quick daily puzzles you can complete in 2–5 minutes without breaking your focus. Think of it as the healthy version of doom-scrolling during a long meeting.",
  },
  {
    q: "Are there free alternatives to NYT Games?",
    a: "Yes. Second Monitor Games offers free daily word puzzles and brain games without a subscription. All daily games are free to play with no paywall.",
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
          The puzzle games people play at work.
        </h1>
        <p
          style={{
            color:      "var(--text-muted)",
            fontSize:   "1.15rem",
            lineHeight: 1.7,
            maxWidth:   "600px",
          }}
        >
          Second Monitor Games is a free daily puzzle game site. We publish new
          word puzzles, brain games, and strategy challenges every day — no
          subscription, no paywall, no account required to play.
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
              icon:        "🟩",
              name:        "Decode",
              type:        "Free Daily Word Puzzle",
              color:       "#538d4e",
              href:        "/games/decode",
              description: "A daily five-letter word puzzle. You have six attempts to guess the hidden word. Green tiles mean the letter is correct and in the right position. Yellow means right letter, wrong position. Grey means the letter isn't in the word. A new word is available every day at midnight — the same word for every player worldwide.",
            },
            {
              icon:        "🃏",
              name:        "The Escape",
              type:        "Daily Card Strategy Puzzle",
              color:       "#c9a84c",
              href:        "/games/the-escape",
              description: "A dark daily card strategy puzzle. Reveal anchors, manage your hand, and escape before your turns run out. Each day brings a new configuration — the same challenge for every player.",
            },
            {
              icon:        "🟦",
              name:        "Tetris",
              type:        "Arcade Brain Game",
              color:       "#00c8ff",
              href:        "/games/tetris",
              description: "The classic block-stacking arcade game, free to play online. Clear lines, beat your daily high score, and see how long you can survive. A new leaderboard resets every day.",
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
