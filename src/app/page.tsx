import type { Metadata } from "next";
import GameCard from "@/components/game/GameCard";
import { KIT_GAMES, kitUrl } from "@/lib/kitGames";

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

// Kit games come from public/proto/games.json (written by `npm run ship` in claude-games),
// newest first; shipping a game with a game.json adds its card here automatically.
const NEW_DAYS = 30;
const KIT_CARDS = KIT_GAMES.map((g, i) => ({
  title: g.title,
  description: g.blurb,
  tag: g.tag,
  href: kitUrl(g.id),
  accentColor: g.accent ?? "#ffd84a",
  bgGradient: `linear-gradient(135deg, #14141c 0%, ${g.accent ?? "#444444"}55 100%)`,
  icon: g.icon ?? "🎮",
  previewImage: g.preview,
  featured: i === 0,
  isNew: !!(g.added ?? g.updated) && Date.now() - Date.parse((g.added ?? g.updated)!) < NEW_DAYS * 86400000,
  cta: "Play",
}));

const GAMES = [
  ...KIT_CARDS,
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
    "itemListElement": GAMES.map((g, n) => ({ "@type": "ListItem", "position": n + 1, "name": `${g.title} — ${g.tag}`, "url": `https://secondmonitorgames.com${g.href}` })),
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
            ● {KIT_CARDS.filter((g) => g.isNew).length || KIT_CARDS.length} new games
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
