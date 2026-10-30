"use client";

// Front-page game grid with type tabs (Word, Puzzle, Card...) and tag tabs (Daily, Roguelite...).
// The choice is kept in the URL (?type=word or ?tag=daily) so a filtered view can be shared.
// Only types and tags that have games are offered, with their counts.

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import GameCard from "@/components/game/GameCard";
import GameDetail, { type DetailGame } from "@/components/game/GameDetail";
import { GAME_TYPES, GAME_TAGS } from "@/lib/gameTypes";

export type GridGame = Omit<React.ComponentProps<typeof GameCard>, "onOpen"> & DetailGame & { type?: string; tags?: string[] };

type Filter = { kind: "all" } | { kind: "type" | "tag"; id: string };

const same = (a: Filter, b: Filter) => a.kind === b.kind && (a.kind === "all" || (b.kind !== "all" && a.id === b.id));

export default function GameGrid({ games }: { games: GridGame[] }) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [openId, setOpenId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(4);

  // How many cards fit across, so an opened card can take over its own row.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setCols(Math.max(1, getComputedStyle(el).gridTemplateColumns.split(" ").length));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Open or fold a card; the grid slides into its new layout where the browser can animate it.
  const show = useCallback((id: string | null) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduce) doc.startViewTransition(() => flushSync(() => setOpenId(id)));
    else setOpenId(id);
  }, []);
  const close = useCallback(() => show(null), [show]);

  const types = GAME_TYPES.map((t) => ({ ...t, count: games.filter((g) => g.type === t.id).length })).filter((t) => t.count);
  const tags = GAME_TAGS.map((t) => ({ ...t, count: games.filter((g) => g.tags?.includes(t.id)).length })).filter((t) => t.count);

  // Read the filter from the URL after hydration (the page itself is static).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const type = q.get("type"), tag = q.get("tag");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (type) setFilter({ kind: "type", id: type });
    else if (tag) setFilter({ kind: "tag", id: tag });
  }, []);

  function choose(f: Filter) {
    setOpenId(null);
    setFilter(f);
    const url = new URL(window.location.href);
    url.searchParams.delete("type");
    url.searchParams.delete("tag");
    if (f.kind !== "all") url.searchParams.set(f.kind, f.id);
    window.history.replaceState(null, "", url);
  }

  // On "All" the featured game is already in the hero above, so the grid starts at 02.
  const shown =
    filter.kind === "type" ? games.filter((g) => g.type === filter.id)
    : filter.kind === "tag" ? games.filter((g) => g.tags?.includes(filter.id))
    : games.filter((g) => !g.featured);

  // The opened card moves to the start of its row and spans it; its row-mates follow it,
  // so the grid stays full and every other card keeps its place.
  const at = shown.findIndex((g) => g.id === openId);
  const ordered = at < 0 ? shown : (() => {
    const rowStart = at - (at % cols);
    const rest = shown.filter((_, i) => i !== at);
    return [...rest.slice(0, rowStart), shown[at], ...rest.slice(rowStart)];
  })();

  const tabs: { f: Filter; name: string; count: number }[] = [
    { f: { kind: "all" }, name: "All", count: games.length },
    ...types.map((t) => ({ f: { kind: "type", id: t.id } as Filter, name: t.name, count: t.count })),
    ...tags.map((t) => ({ f: { kind: "tag", id: t.id } as Filter, name: t.name, count: t.count })),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div role="group" aria-label="Filter games" style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
        {tabs.map((t) => {
          const on = same(t.f, filter);
          return (
            <button
              key={t.name}
              type="button"
              aria-pressed={on}
              onClick={() => choose(t.f)}
              className="font-label smg-tab"
              style={{
                fontSize: "17px", minHeight: "44px", padding: "8px 16px", cursor: "pointer", border: 0,
                background: on ? "var(--accent)" : "transparent",
                color: on ? "var(--bg)" : "var(--text)",
                borderBottom: `3px solid ${on ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {t.name} {t.count}
            </button>
          );
        })}
      </div>

      <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
        {ordered.map((game) =>
          game.id === openId ? (
            <GameDetail key={game.id} game={game} onClose={close} />
          ) : (
            <GameCard key={game.id} {...game} onOpen={() => show(game.id)} />
          ),
        )}
      </div>
    </div>
  );
}
