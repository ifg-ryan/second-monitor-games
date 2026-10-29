"use client";

// Front-page game grid with type tabs (Word, Puzzle, Card...) and tag tabs (Daily, Roguelite...).
// The choice is kept in the URL (?type=word or ?tag=daily) so a filtered view can be shared.
// Only types and tags that have games are offered, with their counts.

import { useEffect, useState } from "react";
import GameCard from "@/components/game/GameCard";
import GameDetail, { type DetailGame } from "@/components/game/GameDetail";
import { GAME_TYPES, GAME_TAGS } from "@/lib/gameTypes";

export type GridGame = Omit<React.ComponentProps<typeof GameCard>, "onOpen"> & DetailGame & { type?: string; tags?: string[] };

type Filter = { kind: "all" } | { kind: "type" | "tag"; id: string };

const same = (a: Filter, b: Filter) => a.kind === b.kind && (a.kind === "all" || (b.kind !== "all" && a.id === b.id));

export default function GameGrid({ games }: { games: GridGame[] }) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [open, setOpen] = useState<GridGame | null>(null);

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
        {shown.map((game) => (
          <GameCard key={game.href} {...game} onOpen={() => setOpen(game)} />
        ))}
      </div>

      {open && <GameDetail key={open.id} game={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
