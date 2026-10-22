import type { Metadata } from "next";
import GameCard from "@/components/game/GameCard";

export const metadata: Metadata = {
  title:       "Free Card Games, Puzzles, Golf & Arcade for Your Second Monitor",
  description: "Quick free browser games built for work breaks: Solitaire, a card battler, a 3D golf driving range, a retro arcade shooter and daily puzzles. No sign-up needed.",
  alternates:  { canonical: "https://secondmonitorgames.com" },
  openGraph: {
    title:       "Second Monitor Games — Daily Card Games & Puzzles for Work Breaks",
    description: "Quick free browser games built for work breaks: card games, puzzles, golf and arcade.",
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
    title: "Long Drive Range",
    description:
      "A 3D driving range. Pick from 12 clubs, nail the 3-click swing, and land it on the targets. Score is distance times accuracy.",
    tag: "Golf",
    href: "/proto/long-drive.html",
    accentColor: "#7bbf4e",
    bgGradient: "linear-gradient(135deg, #9fd3f0 0%, #7bbf4e 100%)",
    icon: "⛳",
    previewImage: "/images/previews/long-drive.jpg",
    featured: true,
    isNew: true,
  },
  {
    title: "Solitaire",
    description:
      "Classic Klondike. Drag, double-click to send home, undo anytime, and win the famous bouncing-card finish.",
    tag: "Card Classic",
    href: "/proto/solitaire.html",
    accentColor: "#4ade80",
    bgGradient: "linear-gradient(135deg, #1f5b3a 0%, #164a2e 100%)",
    icon: "♠️",
    previewImage: "/images/previews/solitaire.jpg",
    featured: false,
    isNew: true,
  },
  {
    title: "Battle Cards",
    description:
      "A quick minion battler. Spend mana, play creatures, trade attacks and bring the enemy hero to zero. Play the computer or a friend.",
    tag: "Card Battle",
    href: "/proto/battle-cards.html",
    accentColor: "#ffd84a",
    bgGradient: "linear-gradient(135deg, #2a2238 0%, #1c1726 100%)",
    icon: "⚔️",
    previewImage: "/images/previews/battle-cards.jpg",
    featured: false,
    isNew: true,
  },
  {
    title: "AstroRogue",
    description:
      "Retro arcade shooter with a roguelite twist. Clear each round, pick 1 of 3 power-ups, survive as long as you can.",
    tag: "Retro Arcade",
    href: "/proto/astro-rogue.html",
    accentColor: "#5ef2ff",
    bgGradient: "linear-gradient(135deg, #05060a 0%, #101626 100%)",
    icon: "🚀",
    previewImage: "/images/previews/astro-rogue.jpg",
    featured: false,
    isNew: true,
  },
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
    featured: false,
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
  },
  {
    title: "Cryptogram",
    description:
      "Crack the daily code. Each number hides a letter — deduce the secret phrase using logic and letter banks.",
    tag: "Code Breaker",
    href: "/games/cryptogram",
    accentColor: "#6c8eff",
    bgGradient: "linear-gradient(135deg, #0a0e1a 0%, #141a30 50%, #0d1225 100%)",
    icon: "🔢",
    previewImage: "/images/previews/cryptogram.png",
    featured: false,
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
];

export default function Home() {
  const today = getTodayLabel();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "ItemList",
    "name":     "Free Browser Games",
    "url":      "https://secondmonitorgames.com",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Long Drive Range — 3D Golf Driving Range", "url": "https://secondmonitorgames.com/proto/long-drive.html" },
      { "@type": "ListItem", "position": 2, "name": "Solitaire — Classic Klondike", "url": "https://secondmonitorgames.com/proto/solitaire.html" },
      { "@type": "ListItem", "position": 3, "name": "Battle Cards — Minion Card Battler", "url": "https://secondmonitorgames.com/proto/battle-cards.html" },
      { "@type": "ListItem", "position": 4, "name": "AstroRogue — Retro Roguelite Shooter", "url": "https://secondmonitorgames.com/proto/astro-rogue.html" },
      { "@type": "ListItem", "position": 5, "name": "The Escape — Daily Card Strategy Puzzle", "url": "https://secondmonitorgames.com/games/the-escape" },
      { "@type": "ListItem", "position": 6, "name": "Decode — Free Daily Word Puzzle", "url": "https://secondmonitorgames.com/games/decode" },
      { "@type": "ListItem", "position": 7, "name": "Cryptogram — Daily Code Breaker", "url": "https://secondmonitorgames.com/games/cryptogram" },
      { "@type": "ListItem", "position": 8, "name": "Block Fall — Daily Arcade Game", "url": "https://secondmonitorgames.com/games/block-fall" },
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
            ● 4 new games
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
            Play Free Games
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              maxWidth: "480px",
              lineHeight: 1.6,
            }}
          >
            Card games, puzzles, golf and arcade, all free to play in your browser. New games added regularly.
          </p>
        </div>

        {/* Game cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAMES.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
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
