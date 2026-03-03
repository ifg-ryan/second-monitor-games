import type { Metadata } from "next";
import GameCard from "@/components/game/GameCard";

export const metadata: Metadata = {
  title:       "Daily Card Games & Puzzles for Your Second Monitor — Play Free",
  description: "Quick daily card games, strategy puzzles, and brain challenges built for work breaks. Play free on your second monitor — new challenges every day, no subscription needed.",
  alternates:  { canonical: "https://secondmonitorgames.com" },
  openGraph: {
    title:       "Second Monitor Games — Daily Card Games & Puzzles for Work Breaks",
    description: "Quick daily card games and strategy puzzles built for work breaks. Free to play — new challenges every day.",
    url:         "https://secondmonitorgames.com",
    type:        "website",
  },
};

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const GAMES = [
  {
    title: "The Escape",
    description:
      "A dark card strategy game. Manage your hand, reveal anchors, and escape before the deck runs out.",
    tag: "Card Strategy",
    href: "/games/the-escape",
    accentColor: "#c9a84c",
    bgGradient: "linear-gradient(135deg, #0a0a0f 0%, #1a1a28 50%, #12100a 100%)",
    icon: "🃏",
    previewImage: "/images/previews/the-escape.png",
    featured: true,
  },
  {
    title: "Decode",
    description:
      "A daily word puzzle. Guess the five-letter word in six tries — new word every day, same for everyone.",
    tag: "Daily Word Puzzle",
    href: "/games/decode",
    accentColor: "#538d4e",
    bgGradient: "linear-gradient(135deg, #121213 0%, #1a1a1b 50%, #0a0f0a 100%)",
    icon: "🟩",
    previewImage: "/images/previews/decode.png",
    featured: false,
    isNew: true,
  },
  {
    title: "Block Fall",
    description:
      "Classic block-stacking arcade. Choose your visual style, clear lines, and beat your high score.",
    tag: "Arcade",
    href: "/games/block-fall",
    accentColor: "#00c8ff",
    bgGradient: "linear-gradient(135deg, #0d1a2e 0%, #0a1420 50%, #060e1a 100%)",
    icon: "🟦",
    previewImage: "/images/previews/block-fall.png",
    featured: false,
  },
  {
    title: "More Coming Soon",
    description:
      "New games in development. Subscribe to get notified when they launch.",
    tag: "Coming Soon",
    href: "#",
    accentColor: "#6b6b8a",
    bgGradient: "linear-gradient(135deg, #111118 0%, #16161f 100%)",
    icon: "🎮",
    featured: false,
    comingSoon: true,
  },
];

export default function Home() {
  const today = getTodayLabel();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "ItemList",
    "name":     "Free Daily Puzzle Games",
    "url":      "https://secondmonitorgames.com",
    "itemListElement": [
      {
        "@type":    "ListItem",
        "position": 1,
        "name":     "The Escape — Daily Card Strategy Puzzle",
        "url":      "https://secondmonitorgames.com/games/the-escape",
      },
      {
        "@type":    "ListItem",
        "position": 2,
        "name":     "Decode — Free Daily Word Puzzle",
        "url":      "https://secondmonitorgames.com/games/decode",
      },
      {
        "@type":    "ListItem",
        "position": 3,
        "name":     "Block Fall — Daily Arcade Game",
        "url":      "https://secondmonitorgames.com/games/block-fall",
      },
    ],
  };

  return (
    <div style={{ background: "var(--bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Date strip ───────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {today}
          </span>
          <span
            style={{
              color: "var(--accent)",
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            ● New games available
          </span>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="flex flex-col gap-3 mb-12">
          <h1
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              lineHeight: 1.1,
            }}
          >
            Today&apos;s Games
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              maxWidth: "480px",
              lineHeight: 1.6,
            }}
          >
            New challenges every day. Free to play.
          </p>
        </div>

        {/* Game cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAMES.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>
      </section>

      {/* ── Subscription banner ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            borderRadius: "16px",
            padding: "40px 48px",
          }}
          className="flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex flex-col gap-2 max-w-lg">
            <h2
              style={{
                fontFamily: "var(--font-dm-serif)",
                color: "var(--text)",
                fontSize: "1.75rem",
              }}
            >
              Play every day, ad&#8209;free.
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Subscribe to Second Monitor Games for an uninterrupted experience.
              Unlimited access to all daily games, full leaderboards, and streak
              tracking — for less than a coffee a month.
            </p>
            <ul className="flex flex-col gap-1 mt-2">
              {[
                "Ad-free gameplay",
                "Daily streak tracking",
                "Full leaderboard access",
                "Early access to new games",
              ].map((perk) => (
                <li
                  key={perk}
                  style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}
                  className="flex items-center gap-2"
                >
                  <span style={{ color: "var(--accent)" }}>✓</span> {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="text-center">
              <div
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  color: "var(--text)",
                  fontSize: "3rem",
                  lineHeight: 1,
                }}
              >
                $4.99
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                per month
              </div>
            </div>
            <a
              href="/subscribe"
              style={{
                background: "var(--accent)",
                color: "#0d0d18",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "14px 36px",
                borderRadius: "10px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              Subscribe Now
            </a>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              Cancel anytime. No commitment.
            </span>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section
        style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text)",
              fontSize: "1.75rem",
              marginBottom: "40px",
              textAlign: "center",
            }}
          >
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📅",
                title: "New games every day",
                body: "Fresh puzzles and challenges unlock each morning. Every player gets the same game — compare your scores with the world.",
              },
              {
                icon: "🏆",
                title: "Compete on leaderboards",
                body: "See how you stack up against other players. Daily leaderboards reset every midnight so every day is a fresh start.",
              },
              {
                icon: "🔥",
                title: "Build your streak",
                body: "Play every day to build and protect your streak. Streaks are the badge of a true daily player.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-3">
                <div style={{ fontSize: "2.5rem" }}>{item.icon}</div>
                <h3
                  style={{
                    fontFamily: "var(--font-dm-serif)",
                    color: "var(--text)",
                    fontSize: "1.125rem",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
