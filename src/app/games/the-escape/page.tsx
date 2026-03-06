import { auth, currentUser } from "@clerk/nextjs/server";
import { getSubscriptionStatus } from "@/lib/subscription";
import GameClient from "@/components/GameClient";

export const metadata = {
  title:       "The Escape — Daily Card Strategy Game",
  description: "A unique daily card strategy game for your second monitor. If you like Balatro or solitaire roguelikes, this is your daily fix — free, 5 minutes, new challenge every day.",
  keywords:    [
    "daily card game",
    "card strategy game online",
    "games like Balatro",
    "card game like Balatro browser",
    "Balatro alternative free",
    "roguelike card game online",
    "solitaire roguelike",
    "unique card game",
    "solitaire strategy game",
    "card deck game browser",
    "quick card game at work",
    "free card puzzle game",
    "second monitor game",
    "games to play at work",
  ],
  alternates:  { canonical: "https://secondmonitorgames.com/games/the-escape" },
  openGraph: {
    title:       "The Escape — Daily Card Strategy Game",
    description: "A unique daily card strategy game. If you like Balatro or solitaire roguelikes, this is your daily fix — free, 5 minutes, new challenge every day.",
    url:         "https://secondmonitorgames.com/games/the-escape",
    type:        "website",
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

async function getPlayerName(): Promise<string | undefined> {
  const user = await currentUser();
  if (!user) return undefined;
  return user.fullName || user.firstName || user.username || undefined;
}

export default async function TheEscapePage() {
  const today = getTodayLabel();
  const [{ tier, trialDaysLeft }, playerName] = await Promise.all([
    getUserTier(),
    getPlayerName(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>

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
            The Escape
          </span>
          <span
            style={{
              background: "rgba(201, 168, 76, 0.15)",
              color: "#c9a84c",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 7px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            Card Strategy
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
        gameSrc="/games/the-escape.html"
        gameTitle="The Escape"
        bgColor="#0a0a0f"
        tier={tier}
        trialDaysLeft={trialDaysLeft}
        playerName={playerName}
      />
    </div>
  );
}
