import { auth } from "@clerk/nextjs/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import GameClient from "@/components/GameClient";

export const metadata = {
  title:       "Decode — Free Daily Word Puzzle Game",
  description: "A quick daily word puzzle for your second monitor. Guess the word in six tries — takes under 2 minutes. Free to play, new puzzle every day, no subscription needed.",
  keywords:    ["daily word puzzle", "quick word game", "free daily puzzle game", "word puzzle at work", "brain game for work break", "second monitor game", "unique puzzle game online", "games to play between meetings"],
  alternates:  { canonical: "https://secondmonitorgames.com/games/decode" },
  openGraph: {
    title:       "Decode — Free Daily Word Puzzle Game",
    description: "A quick daily word puzzle for your second monitor. Guess the word in six tries — under 2 minutes, free.",
    url:         "https://secondmonitorgames.com/games/decode",
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Decode — Free Daily Word Puzzle Game",
    description: "A quick daily word puzzle for your second monitor. Guess the word in six tries — free, under 2 minutes.",
  },
};

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

async function getUserTier(): Promise<{ tier: "free" | "trial" | "subscriber"; trialDaysLeft: number }> {
  const { userId } = await auth();
  if (!userId) return { tier: "free", trialDaysLeft: 0 };

  const sub = await getSubscriptionStatus(userId);
  if (!sub.isActive) return { tier: "free", trialDaysLeft: 0 };

  if (sub.status === "trialing") {
    const daysLeft = sub.trialEnd
      ? Math.max(0, Math.ceil((sub.trialEnd.getTime() - Date.now()) / 86400000))
      : 0;
    return { tier: "trial", trialDaysLeft: daysLeft };
  }

  return { tier: "subscriber", trialDaysLeft: 0 };
}

export default async function DecodePage() {
  const today = getTodayLabel();
  const { tier, trialDaysLeft } = await getUserTier();

  const jsonLd = {
    "@context":           "https://schema.org",
    "@type":              "VideoGame",
    "name":               "Decode",
    "description":        "A free daily five-letter word puzzle game. Guess the word in six tries — green for correct, yellow for wrong position, grey for not in word. New puzzle every day.",
    "url":                "https://secondmonitorgames.com/games/decode",
    "applicationCategory": "Game",
    "genre":              ["Puzzle", "Word Game", "Brain Game"],
    "gamePlatform":       "Web Browser",
    "operatingSystem":    "Any",
    "offers": {
      "@type":         "Offer",
      "price":         "0",
      "priceCurrency": "USD",
    },
    "publisher": {
      "@type": "Organization",
      "name":  "Second Monitor Games",
      "url":   "https://secondmonitorgames.com",
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Game info bar ───────────────────────────────────── */}
      <div
        style={{
          height: "48px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        {/* Back */}
        <a
          href="/"
          className="nav-link-muted"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Today&apos;s Games
        </a>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text)",
              fontSize: "1rem",
            }}
          >
            Decode
          </span>
          <span
            style={{
              background: "rgba(83, 141, 78, 0.15)",
              color: "#538d4e",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 7px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            Word Game
          </span>
        </div>

        {/* Date */}
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
          }}
        >
          {today}
        </span>
      </div>

      {/* ── Game iframe ─────────────────────────────────────── */}
      <GameClient
        gameSrc="/games/decode.html"
        gameTitle="Decode"
        bgColor="#121213"
        tier={tier}
        trialDaysLeft={trialDaysLeft}
      />
    </div>
  );
}
