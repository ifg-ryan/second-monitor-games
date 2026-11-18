"use client";

// PROTOTYPE, throwaway. Lives on the prototype/played-today branch only and is never merged.
// Question: what should the "played today" marker on the front-page game cards look like?
// Three looks on the real front page, switched with ?variant=A|B|C (or the arrow keys),
// over made-up play data switched with ?played=none|some|all. Nothing here reads real plays.

import { useCallback, useEffect, useState } from "react";

export type Variant = "A" | "B" | "C";
export type Sample = "none" | "some" | "all";
/** started and done are for daily games; played is for every other game. */
export type Mark = "played" | "started" | "done" | null;

export const VARIANTS: { id: Variant; name: string }[] = [
  { id: "A", name: "Corner badge" },
  { id: "B", name: "Dimmed with check" },
  { id: "C", name: "Scoreboard strip" },
];
const SAMPLES: Sample[] = ["some", "all", "none"];

type ProtoGame = { id: string; title: string; tags?: string[] };

const isDaily = (g: ProtoGame) => !!g.tags?.includes("daily");
/** A game counts as ticked off for today when it was played, or (a daily) finished. */
export const ticked = (m: Mark) => m === "played" || m === "done";

function sampleMark(g: ProtoGame, i: number, sample: Sample): Mark {
  if (sample === "none") return null;
  if (sample === "all") return isDaily(g) ? "done" : "played";
  if (g.id === "fiver") return "done";
  if (g.id === "hive") return "started";
  if (isDaily(g)) return null;
  return i % 3 === 0 ? "played" : null;
}

/** Off on the live site, so a stray merge could never show made-up data to players. */
const live = () => /(^|\.)secondmonitorgames\.com$/.test(window.location.hostname);

export function usePlayedPrototype(games: ProtoGame[]) {
  const [on, setOn] = useState(false);
  const [variant, setVariantState] = useState<Variant>("A");
  const [sample, setSampleState] = useState<Sample>("some");

  useEffect(() => {
    if (live()) return;
    const q = new URLSearchParams(window.location.search);
    const v = q.get("variant"), p = q.get("played");
    /* eslint-disable react-hooks/set-state-in-effect */
    setOn(true);
    if (v === "A" || v === "B" || v === "C") setVariantState(v);
    if (p === "none" || p === "some" || p === "all") setSampleState(p);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const put = (key: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState(null, "", url);
  };
  const setVariant = useCallback((v: Variant) => { setVariantState(v); put("variant", v); }, []);
  const setSample = useCallback((s: Sample) => { setSampleState(s); put("played", s); }, []);

  const step = useCallback((by: number) => {
    const at = VARIANTS.findIndex((x) => x.id === variant);
    setVariant(VARIANTS[(at + by + VARIANTS.length) % VARIANTS.length].id);
  }, [variant, setVariant]);

  useEffect(() => {
    if (!on) return;
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [on, step]);

  const marks = new Map<string, Mark>(games.map((g, i) => [g.id, on ? sampleMark(g, i, sample) : null]));
  const nextSample = () => setSample(SAMPLES[(SAMPLES.indexOf(sample) + 1) % SAMPLES.length]);
  return { on, variant, sample, marks, step, nextSample };
}

/** Look A and B: what sits on top of a card's picture. */
export function CardMark({ variant, mark }: { variant: Variant; mark: Mark }) {
  if (!mark) return null;
  if (variant === "A") {
    const done = ticked(mark);
    return (
      <span
        className="font-label"
        style={{
          position: "absolute", top: "10px", left: "10px", fontSize: "13px", padding: "3px 8px",
          background: done ? "var(--text)" : "transparent", color: done ? "var(--bg)" : "var(--text)",
          border: "2px solid var(--text)",
        }}
      >
        {mark === "played" ? "✓ Played" : mark === "done" ? "✓ Done" : "Started"}
      </span>
    );
  }
  if (variant === "B") {
    if (!ticked(mark)) {
      return (
        <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "6px", background: "var(--border)" }}>
          <span style={{ display: "block", width: "50%", height: "100%", background: "var(--accent)" }} />
        </span>
      );
    }
    return (
      <span
        className="font-display"
        style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "96px", lineHeight: 1, color: "var(--text)", background: "rgba(10,19,14,0.55)",
        }}
      >
        ✓
      </span>
    );
  }
  return null;
}

/** Look C: one strip above the grid with a pip per game. */
export function ChecklistStrip({ games, marks, onPick }: { games: ProtoGame[]; marks: Map<string, Mark>; onPick: (id: string) => void }) {
  const count = games.filter((g) => ticked(marks.get(g.id) ?? null)).length;
  const all = count === games.length;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px", padding: "16px 20px", background: "var(--surface)", borderLeft: `6px solid ${all ? "var(--accent)" : "var(--border)"}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
        <span className="font-label" style={{ fontSize: "16px", color: "var(--text-muted)" }}>Today</span>
        <span className="font-display" style={{ fontSize: "44px", lineHeight: 1, color: all ? "var(--accent)" : "var(--text)" }}>
          {count}<span style={{ color: "var(--text-muted)" }}> / {games.length}</span>
        </span>
        {all && <span className="font-label" style={{ fontSize: "16px", color: "var(--accent)" }}>Clean sweep</span>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: "1 1 320px" }}>
        {games.map((g) => {
          const m = marks.get(g.id) ?? null;
          return (
            <button
              key={g.id}
              type="button"
              title={`${g.title}: ${ticked(m) ? "played today" : m === "started" ? "started" : "not played yet"}`}
              aria-label={`${g.title}: ${ticked(m) ? "played today" : m === "started" ? "started" : "not played yet"}`}
              onClick={() => onPick(g.id)}
              style={{
                width: "22px", height: "22px", padding: 0, cursor: "pointer",
                border: `2px solid ${m ? "var(--accent)" : "var(--border)"}`,
                background: ticked(m) ? "var(--accent)" : m === "started" ? "linear-gradient(90deg, var(--accent) 50%, transparent 50%)" : "transparent",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** The floating bar: which look, which sample data. Not part of any look. */
export function PrototypeSwitcher({ variant, sample, count, total, step, nextSample }: { variant: Variant; sample: Sample; count: number; total: number; step: (by: number) => void; nextSample: () => void }) {
  const v = VARIANTS.find((x) => x.id === variant)!;
  const btn: React.CSSProperties = { background: "#111", color: "#fff", border: "1px solid #fff", padding: "6px 12px", cursor: "pointer", font: "inherit" };
  return (
    <div
      style={{
        position: "fixed", left: "50%", bottom: "16px", transform: "translateX(-50%)", zIndex: 9999,
        display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px",
        background: "#fff", color: "#111", boxShadow: "0 6px 24px rgba(0,0,0,0.6)", fontFamily: "system-ui, sans-serif", fontSize: "14px", whiteSpace: "nowrap",
      }}
    >
      <strong>PROTOTYPE</strong>
      <button type="button" aria-label="Previous look" onClick={() => step(-1)} style={{ ...btn, borderRadius: "999px" }}>←</button>
      <span style={{ minWidth: "170px", textAlign: "center" }}>{v.id} · {v.name}</span>
      <button type="button" aria-label="Next look" onClick={() => step(1)} style={{ ...btn, borderRadius: "999px" }}>→</button>
      <button type="button" onClick={nextSample} style={{ ...btn, borderRadius: "999px" }}>Made-up plays: {sample} ({count} of {total})</button>
    </div>
  );
}
