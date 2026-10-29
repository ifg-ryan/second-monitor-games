"use client";

// A game's all-time top 5, Scoreboard style. Games with several leaderboards (Putt Party's
// courses) get tabs, one per board. Rows come from the server (front-page headliner) or are
// fetched from /api/kit/score when the board is first shown (expanded game cards).
//   <TopFive game="putt-party" boards={[{ id: 'seaside', name: 'Seaside Classic' }]} initial={{ seaside: rows }} />

import { useEffect, useState } from "react";

export interface ScoreRow { name: string; score: number }
export interface BoardTab { id: string | null; name: string | null }

const keyOf = (b: BoardTab) => b.id ?? "";

export default function TopFive({ game, boards, initial, onPick }: { game: string; boards: BoardTab[]; initial?: Record<string, ScoreRow[]>; onPick?: (board: string | null) => void }) {
  const [pick, setPick] = useState(keyOf(boards[0]));
  const [rows, setRows] = useState<Record<string, ScoreRow[] | "error">>(initial ?? {});
  const shown = rows[pick];

  useEffect(() => {
    if (rows[pick] !== undefined) return;
    let live = true;
    const q = `?game=${encodeURIComponent(game)}&limit=5${pick ? `&board=${encodeURIComponent(pick)}` : ""}`;
    fetch(`/api/kit/score${q}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { top: ScoreRow[] }) => live && setRows((m) => ({ ...m, [pick]: d.top })))
      .catch(() => live && setRows((m) => ({ ...m, [pick]: "error" })));
    return () => { live = false; };
  }, [game, pick, rows]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <h2 className="font-display" style={{ margin: 0, fontSize: "30px" }}>
        Top 5 <span style={{ color: "var(--accent)" }}>All time</span>
      </h2>
      {boards.length > 1 && (
        <div role="group" aria-label="Leaderboard" style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {boards.map((b) => {
            const on = keyOf(b) === pick;
            return (
              <button
                key={keyOf(b)}
                type="button"
                aria-pressed={on}
                onClick={() => { setPick(keyOf(b)); onPick?.(b.id); }}
                className="font-label smg-tab"
                style={{
                  fontSize: "14px", minHeight: "36px", padding: "6px 10px", cursor: "pointer",
                  background: on ? "var(--accent)" : "var(--ink-deep)", color: on ? "var(--bg)" : "var(--text)",
                  border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", minHeight: "150px" }}>
        {shown === undefined ? (
          <p className="font-label" style={{ margin: 0, padding: "16px 0", borderTop: "1px solid var(--border)", fontSize: "18px", color: "var(--text-muted)" }}>Loading</p>
        ) : shown === "error" ? (
          <p className="font-label" style={{ margin: 0, padding: "16px 0", borderTop: "1px solid var(--border)", fontSize: "18px", color: "var(--text-muted)" }}>Board offline</p>
        ) : shown.length === 0 ? (
          <p className="font-label" style={{ margin: 0, padding: "16px 0", borderTop: "1px solid var(--border)", fontSize: "18px", color: "var(--text-muted)" }}>Board is open. Post the first score.</p>
        ) : (
          shown.map((r, i) => (
            <div key={`${r.name}-${i}`} style={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr) auto", gap: "12px", alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--border)" }}>
              <span className="font-display" style={{ fontSize: "24px", color: i === 0 ? "var(--accent)" : "var(--text-muted)" }}>{i + 1}</span>
              <span className="font-label" style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
              <span className="font-display" style={{ fontSize: "22px", color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{r.score.toLocaleString("en-US")}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
