import { auth } from "@clerk/nextjs/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import GameClient from "@/components/GameClient";

export const metadata = {
  title:       "Cryptogram — Free Daily Code-Breaking Puzzle",
  description: "Crack the code in today's cryptogram. Each number hides a letter — deduce the phrase using logic and letter banks. Free daily puzzle, new challenge every day.",
  keywords:    ["daily cryptogram", "code-breaking puzzle", "free daily puzzle game", "letter cipher game", "brain game for work break", "second monitor game", "cryptogram puzzle online"],
  alternates:  { canonical: "https://secondmonitorgames.com/games/cryptogram" },
  openGraph: {
    title:       "Cryptogram — Free Daily Code-Breaking Puzzle",
    description: "Crack the code in today's cryptogram. Each number hides a letter — deduce the phrase. Free, under 5 minutes.",
    url:         "https://secondmonitorgames.com/games/cryptogram",
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Cryptogram — Free Daily Code-Breaking Puzzle",
    description: "Crack the code in today's cryptogram. Each number hides a letter — free daily puzzle.",
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

export default async function CryptogramPage() {
  const today = getTodayLabel();
  const { tier, trialDaysLeft } = await getUserTier();

  const jsonLd = {
    "@context":           "https://schema.org",
    "@type":              "VideoGame",
    "name":               "Cryptogram",
    "description":        "A free daily code-breaking puzzle. Each number hides a letter — deduce the secret phrase using logic and letter banks. New puzzle every day, same for everyone.",
    "url":                "https://secondmonitorgames.com/games/cryptogram",
    "applicationCategory": "Game",
    "genre":              ["Puzzle", "Code-Breaking", "Brain Game"],
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

      {/* Game info bar */}
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text)",
              fontSize: "1rem",
            }}
          >
            Cryptogram
          </span>
          <span
            style={{
              background: "rgba(108, 142, 255, 0.15)",
              color: "#6c8eff",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 7px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            Code Breaker
          </span>
        </div>

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

      <GameClient
        gameSrc="/games/cryptogram.html"
        gameTitle="Cryptogram"
        bgColor="#121213"
        tier={tier}
        trialDaysLeft={trialDaysLeft}
      />
    </div>
  );
}
