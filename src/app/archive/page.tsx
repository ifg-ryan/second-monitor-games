import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { isSubscribed } from "@/lib/subscription";

export const metadata: Metadata = {
  title:       "Game Archive — Every Past Puzzle | Second Monitor Games",
  description: "Browse every past daily puzzle on Second Monitor Games — Decode word puzzles, The Escape card game, and Tetris. Subscribe to replay any past challenge.",
  alternates:  { canonical: "https://secondmonitorgames.com/archive" },
  robots:      { index: true, follow: true },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getUtcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    timeZone: "UTC",
  });
}

interface PuzzleDay {
  dateStr:      string;
  label:        string;
  puzzleNumber: number;
  isToday:      boolean;
}

function getPuzzleDays(launchDateStr: string, limit = 60): PuzzleDay[] {
  const today    = getUtcToday();
  const launch   = new Date(launchDateStr + "T00:00:00Z");
  const days: PuzzleDay[] = [];

  for (let i = 0; i < limit; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    if (d < launch) break;

    const diffMs   = d.getTime() - launch.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const dateStr  = d.toISOString().split("T")[0];

    days.push({
      dateStr,
      label:        formatDateLabel(dateStr),
      puzzleNumber: diffDays + 1,
      isToday:      i === 0,
    });
  }

  return days;
}

// ── Game definitions ──────────────────────────────────────────────────────────

const GAMES = [
  {
    id:          "decode",
    name:        "Decode",
    tag:         "Word Game",
    tagColor:    "#538d4e",
    icon:        "🟩",
    href:        "/games/decode",
    launchDate:  "2026-03-01",
    gameType:    "puzzle" as const,
    description: "Six tries. One word. Same puzzle for every player each day.",
  },
  {
    id:          "the-escape",
    name:        "The Escape",
    tag:         "Card Strategy",
    tagColor:    "#c9a84c",
    icon:        "🃏",
    href:        "/games/the-escape",
    launchDate:  "2026-01-06",
    gameType:    "puzzle" as const,
    description: "Reveal anchors, manage your hand, and escape before the turns run out.",
  },
  {
    id:          "tetris",
    name:        "Tetris",
    tag:         "Arcade",
    tagColor:    "#00c8ff",
    icon:        "🟦",
    href:        "/games/tetris",
    launchDate:  "2026-01-06",
    gameType:    "arcade" as const,
    description: "Daily high score challenge. Leaderboard resets every midnight.",
  },
];

// ── Gating helper (pure — exported for testing) ───────────────────────────────

/**
 * Returns the href for a past archive item.
 * Subscribers get a date-parameterised game link; others are sent to /pricing.
 */
export function getArchivePastHref(gameHref: string, dateStr: string, subscribed: boolean): string {
  if (!subscribed) return "/subscribe";
  return `${gameHref}?date=${dateStr}`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ArchivePage() {
  const { userId } = await auth();
  const subscribed = userId ? await isSubscribed(userId) : false;

  const allPuzzleDays = Object.fromEntries(
    GAMES.map((g) => [g.id, getPuzzleDays(g.launchDate)])
  );

  return (
    <div style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-20">

        {/* ── Header ────────────────────────────────────────────── */}
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
          Archive
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6" style={{ marginBottom: "48px" }}>
          <div>
            <h1
              style={{
                fontFamily:   "var(--font-dm-serif)",
                color:        "var(--text)",
                fontSize:     "clamp(1.75rem, 4vw, 2.75rem)",
                lineHeight:   1.15,
                marginBottom: "12px",
              }}
            >
              Past puzzles
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: "520px" }}>
              Every puzzle ever published on Second Monitor Games — one new challenge
              per game, every day at midnight UTC. Subscribe to replay any of them.
            </p>
          </div>

          {/* Subscribe CTA — only shown to non-subscribers */}
          {!subscribed && (
            <div style={{ flexShrink: 0 }}>
              <a
                href="/subscribe"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            "8px",
                  background:     "var(--accent)",
                  color:          "#0d0d18",
                  fontWeight:     700,
                  fontSize:       "0.9rem",
                  padding:        "12px 28px",
                  borderRadius:   "9px",
                  textDecoration: "none",
                  whiteSpace:     "nowrap",
                }}
              >
                🔓 Unlock Archive — $4.99/mo
              </a>
            </div>
          )}
        </div>

        {/* ── Games ─────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ gap: "56px" }}>
          {GAMES.map((game) => {
            const days = allPuzzleDays[game.id];
            const total = days.length;

            return (
              <section key={game.id}>
                {/* Game header */}
                <div
                  className="flex items-center gap-4 flex-wrap"
                  style={{
                    borderBottom:  "1px solid var(--border)",
                    paddingBottom: "14px",
                    marginBottom:  "20px",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{game.icon}</span>
                  <h2
                    style={{
                      fontFamily: "var(--font-dm-serif)",
                      color:      "var(--text)",
                      fontSize:   "1.35rem",
                      margin:     0,
                    }}
                  >
                    {game.name}
                  </h2>
                  <span
                    style={{
                      background:    `${game.tagColor}18`,
                      color:         game.tagColor,
                      fontSize:      "10px",
                      fontWeight:    700,
                      letterSpacing: "0.1em",
                      padding:       "3px 8px",
                      borderRadius:  "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {game.tag}
                  </span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {total} {total === 1 ? "puzzle" : "puzzles"} available
                  </span>
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "20px" }}>
                  {game.description}
                </p>

                {/* Tetris note */}
                {game.gameType === "arcade" && (
                  <div
                    style={{
                      background:   "var(--surface)",
                      border:       "1px solid var(--border)",
                      borderRadius: "10px",
                      padding:      "16px 20px",
                      color:        "var(--text-muted)",
                      fontSize:     "0.875rem",
                      lineHeight:   1.7,
                    }}
                  >
                    <strong style={{ color: "var(--text-dim)" }}>Arcade format: </strong>
                    Tetris is a daily high-score challenge, not a fixed puzzle. The leaderboard
                    resets every midnight. Past day scores are preserved for subscribers — you can
                    see how you ranked on any previous day.
                  </div>
                )}

                {/* Puzzle grid */}
                {game.gameType === "puzzle" && (
                  <div
                    style={{
                      display:             "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                      gap:                 "10px",
                    }}
                  >
                    {days.map((day) => {
                      const isToday = day.isToday;

                      return (
                        <div key={day.dateStr} style={{ position: "relative" }}>
                          {isToday ? (
                            /* Today — free, always playable */
                            <a
                              href={game.href}
                              style={{
                                display:        "block",
                                background:     `${game.tagColor}18`,
                                border:         `1px solid ${game.tagColor}55`,
                                borderRadius:   "9px",
                                padding:        "12px 14px",
                                textDecoration: "none",
                                transition:     "border-color 0.15s, background 0.15s",
                              }}
                            >
                              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: game.tagColor, marginBottom: "5px" }}>
                                Today · Free
                              </div>
                              <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.8rem", marginBottom: "3px" }}>
                                {day.label}
                              </div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                #{day.puzzleNumber}
                              </div>
                            </a>
                          ) : subscribed ? (
                            /* Past — subscriber, unlocked */
                            <a
                              href={getArchivePastHref(game.href, day.dateStr, true)}
                              style={{
                                display:        "block",
                                background:     `${game.tagColor}10`,
                                border:         `1px solid ${game.tagColor}40`,
                                borderRadius:   "9px",
                                padding:        "12px 14px",
                                textDecoration: "none",
                                transition:     "border-color 0.15s, background 0.15s",
                              }}
                            >
                              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "5px" }}>
                                ✓ Unlocked
                              </div>
                              <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.8rem", marginBottom: "3px" }}>
                                {day.label}
                              </div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                #{day.puzzleNumber}
                              </div>
                            </a>
                          ) : (
                            /* Past — not subscribed, locked */
                            <a
                              href="/subscribe"
                              style={{
                                display:        "block",
                                background:     "var(--surface)",
                                border:         "1px solid var(--border)",
                                borderRadius:   "9px",
                                padding:        "12px 14px",
                                textDecoration: "none",
                                opacity:        0.75,
                                transition:     "opacity 0.15s, border-color 0.15s",
                              }}
                            >
                              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <span>🔒</span> Subscribers
                              </div>
                              <div style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: "0.8rem", marginBottom: "3px" }}>
                                {day.label}
                              </div>
                              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", opacity: 0.7 }}>
                                #{day.puzzleNumber}
                              </div>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* ── Bottom CTA — only shown to non-subscribers ───────── */}
        {!subscribed && (
          <div
            style={{
              marginTop:    "64px",
              background:   "var(--surface)",
              border:       "1px solid var(--border)",
              borderRadius: "16px",
              padding:      "40px",
              textAlign:    "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🔓</div>
            <h2
              style={{
                fontFamily:   "var(--font-dm-serif)",
                color:        "var(--text)",
                fontSize:     "1.5rem",
                marginBottom: "10px",
              }}
            >
              Unlock the full archive
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: "420px", margin: "0 auto 24px" }}>
              Subscribe for $4.99/month to play every past puzzle, go ad-free,
              and unlock full stats and leaderboards.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="/subscribe"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            "8px",
                  background:     "var(--accent)",
                  color:          "#0d0d18",
                  fontWeight:     700,
                  fontSize:       "0.95rem",
                  padding:        "13px 32px",
                  borderRadius:   "10px",
                  textDecoration: "none",
                }}
              >
                Start free trial →
              </a>
              <a
                href="/"
                style={{
                  color:          "var(--text-muted)",
                  fontSize:       "0.875rem",
                  textDecoration: "none",
                }}
              >
                Play today&apos;s free games instead
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
