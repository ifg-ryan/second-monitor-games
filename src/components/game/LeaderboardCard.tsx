"use client";

// One game on the leaderboard page: its front-page art and title on the left, its top 10 on the
// right. Games with several boards (Putt Party's courses) get a tab per board, and Play opens the
// board on show. /leaderboard#<game id>-<board id> (or ?board=<id>#<game id>) opens that tab.

import { useEffect, useState } from "react";
import Image from "next/image";

export interface BoardRow { playerId: string; name: string; score: number; isGuest: boolean }
export interface BoardData { id: string | null; name: string | null; rows: BoardRow[]; ok: boolean }
export interface CardGame { id: string; title: string; tag: string; href: string; stripe: string; preview?: string; minutes?: [number, number]; label: string }

export default function LeaderboardCard({ game, boards, userId }: { game: CardGame; boards: BoardData[]; userId: string | null }) {
  const [on, setOn] = useState(0);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const query = new URLSearchParams(window.location.search).get("board");
    const i = boards.findIndex((b) => b.id && (hash === `${game.id}-${b.id}` || (hash === game.id && query === b.id)));
    if (i < 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(i);
    if (hash !== game.id) document.getElementById(game.id)?.scrollIntoView();
  }, [game.id, boards]);

  const board = boards[on] ?? boards[0];
  const play = board.id ? `${game.href}?board=${board.id}` : game.href;

  return (
    <section id={game.id} className="smg-board" style={{ background: "var(--surface)", borderTop: `4px solid ${game.stripe}`, scrollMarginTop: "80px" }}>
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)" }}>
        <a href={play} className="smg-board-art" aria-label={`Play ${game.title}`} style={{ position: "relative", display: "block", aspectRatio: "16 / 10", background: "var(--ink-deep)", overflow: "hidden" }}>
          {game.preview && (
            <Image src={game.preview} alt="" fill sizes="(max-width: 720px) 100vw, 280px" style={{ objectFit: "cover", objectPosition: "top center", opacity: 0.92 }} />
          )}
        </a>
        <div style={{ padding: "14px 16px 18px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          <h2 className="font-display" style={{ fontSize: "26px", lineHeight: 1.05, margin: 0, color: "var(--text)" }}>{game.title}</h2>
          <span className="font-label" style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>
            {game.tag}{game.minutes ? ` · ${game.minutes[0]}–${game.minutes[1]} min` : ""}
          </span>
          <a href={play} className="smg-play font-label" style={{ alignSelf: "flex-start", marginTop: "6px", background: "var(--accent)", color: "var(--bg)", fontSize: "15px", padding: "8px 16px", textDecoration: "none" }}>
            Play
          </a>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        {boards.length > 1 && (
          <div role="tablist" aria-label={`${game.title} leaderboards`} style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid var(--border)" }}>
            {boards.map((b, i) => (
              <button
                key={b.id ?? i}
                type="button"
                role="tab"
                aria-selected={i === on}
                onClick={() => setOn(i)}
                className="font-label smg-tab"
                style={{
                  flex: "1 0 auto", fontSize: "13px", letterSpacing: "0.06em", whiteSpace: "nowrap", minHeight: "44px", padding: "6px 12px", cursor: "pointer", border: 0,
                  background: i === on ? "var(--accent)" : "transparent",
                  color: i === on ? "var(--bg)" : "var(--text)",
                }}
              >
                {b.name}
              </button>
            ))}
          </div>
        )}
        <div className="font-label" style={{ display: "grid", gridTemplateColumns: "48px 1fr 120px", padding: "10px 20px 6px", fontSize: "12px", color: "var(--text-muted)" }}>
          <span>#</span><span>Player</span><span style={{ textAlign: "right" }}>Best {game.label}</span>
        </div>
        <div role={boards.length > 1 ? "tabpanel" : undefined}>
          {!board.ok ? (
            <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>Leaderboard warming up. Check back soon.</div>
          ) : board.rows.length === 0 ? (
            <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>No scores yet. Be the first on the board!</div>
          ) : (
            board.rows.map((r, i) => {
              const me = userId && r.playerId === userId;
              return (
                <div key={r.playerId} style={{ display: "grid", gridTemplateColumns: "48px 1fr 120px", padding: "9px 20px", fontSize: "0.9rem", borderTop: "1px solid var(--border)", background: me ? "var(--accent-dim)" : "transparent", color: "var(--text)" }}>
                  <span className="font-display" style={{ color: i === 0 ? "var(--accent)" : "var(--text-muted)", fontSize: "1.1rem" }}>{i + 1}</span>
                  <span style={{ fontWeight: me ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}
                    {r.isGuest && <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}> · guest</span>}
                    {me && <span style={{ color: "var(--accent)", fontSize: "0.75rem" }}> · you</span>}
                  </span>
                  <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{r.score.toLocaleString("en-US")}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
