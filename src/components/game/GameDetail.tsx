"use client";

// The expanded game card: a front-page card opens into this right in the grid, a full row wide,
// laid out like the headliner (big art and title, what the game is, length and type, its top 5)
// with Play. The close button or Esc folds it back into a card.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TopFive, { type BoardTab } from "@/components/game/TopFive";

export interface DetailGame {
  id: string;
  title: string;
  description: string;
  tag: string;
  href: string;
  stripe: string;
  previewImage?: string;
  number: number;
  minutes?: [number, number];
  boards: BoardTab[];
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "12px 16px", background: "var(--ink-deep)", border: "1px solid var(--border)" }}>
      <span className="font-label" style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
      <span className="font-display" style={{ fontSize: "24px", color: "var(--accent)", lineHeight: 1.1 }}>{value}</span>
    </div>
  );
}

export default function GameDetail({ game, onClose }: { game: DetailGame; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  // Play opens the board picked in the top 5 (Putt Party: that course).
  const [board, setBoard] = useState<string | null>(game.boards[0]?.id ?? null);
  const playHref = board ? `${game.href}?board=${encodeURIComponent(board)}` : game.href;

  // Bring the opened card into view and let Esc fold it.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <article
      ref={ref}
      aria-label={game.title}
      className="smg-expanded"
      style={{ gridColumn: "1 / -1", scrollMarginTop: "calc(var(--nav-h) + 16px)", borderTop: `4px solid ${game.stripe}`, background: "var(--surface)", color: "var(--text)", viewTransitionName: `card-${game.id}` }}
    >
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <section style={{ flex: "999 1 560px", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative", aspectRatio: "2 / 1", background: "var(--ink-deep)" }}>
            {game.previewImage && (
              <Image src={game.previewImage} alt={`${game.title} gameplay preview`} fill sizes="(max-width: 1080px) 100vw, 800px" style={{ objectFit: "cover", opacity: 0.9 }} />
            )}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "120px 28px 24px", background: "linear-gradient(0deg, rgba(19,31,24,1) 0%, rgba(19,31,24,0.85) 45%, rgba(19,31,24,0) 100%)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span className="font-label" style={{ fontSize: "17px", color: "var(--accent)", letterSpacing: "0.16em" }}>
                {String(game.number).padStart(2, "0")} · {game.tag}
              </span>
              <h2 className="font-display" style={{ margin: 0, fontSize: "clamp(44px, 6vw, 84px)", lineHeight: 0.92 }}>{game.title}</h2>
            </div>
          </div>
          <div style={{ padding: "4px 28px 28px", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-end", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "18px", lineHeight: 1.5, maxWidth: "520px", color: "var(--text)" }}>{game.description}</p>
            <a href={playHref} className="font-display smg-play" style={{ textDecoration: "none", background: "var(--accent)", color: "var(--bg)", padding: "14px 40px", fontSize: "28px" }}>
              Play
            </a>
          </div>
        </section>

        <aside style={{ flex: "1 1 320px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg)", border: "1px solid var(--surface)" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              aria-label={`Close ${game.title}`}
              onClick={onClose}
              className="smg-tab"
              style={{ width: "44px", height: "44px", display: "grid", placeItems: "center", background: "none", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer" }}
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l10 10M13 3L3 13" /></svg>
            </button>
          </div>
          <TopFive game={game.id} boards={game.boards} onPick={setBoard} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "auto" }}>
            {game.minutes && <Stat label="Length" value={`${game.minutes[0]}–${game.minutes[1]} min`} />}
            <Stat label="Type" value={game.tag} />
          </div>
        </aside>
      </div>
    </article>
  );
}
