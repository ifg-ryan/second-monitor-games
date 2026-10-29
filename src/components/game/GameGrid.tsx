"use client";

// Front-page game grid with a type filter (Word, Puzzle, Card...) and tag filters (Daily, Roguelite...).
// The choice is kept in the URL (?type=word or ?tag=daily) so a filtered view can be shared.
// Only types and tags that have games are offered, with their counts.

import { useEffect, useState } from "react";
import GameCard from "@/components/game/GameCard";
import { GAME_TYPES, GAME_TAGS } from "@/lib/gameTypes";

export type GridGame = React.ComponentProps<typeof GameCard> & { type?: string; tags?: string[] };

type Filter = { kind: "all" } | { kind: "type" | "tag"; id: string };

const toValue = (f: Filter) => (f.kind === "all" ? "all" : `${f.kind}:${f.id}`);
function fromValue(v: string): Filter {
  const [kind, id] = v.split(":");
  return (kind === "type" || kind === "tag") && id ? { kind, id } : { kind: "all" };
}

export default function GameGrid({ games }: { games: GridGame[] }) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });

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

  function choose(v: string) {
    const f = fromValue(v);
    setFilter(f);
    const url = new URL(window.location.href);
    url.searchParams.delete("type");
    url.searchParams.delete("tag");
    if (f.kind !== "all") url.searchParams.set(f.kind, f.id);
    window.history.replaceState(null, "", url);
  }

  const shown =
    filter.kind === "type" ? games.filter((g) => g.type === filter.id)
    : filter.kind === "tag" ? games.filter((g) => g.tags?.includes(filter.id))
    : games;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
        <div className="flex flex-col gap-3">
          <h1
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              lineHeight: 1.1,
            }}
          >
            Play Free Games
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              maxWidth: "480px",
              lineHeight: 1.6,
            }}
          >
            Card games, puzzles, golf and arcade, all free to play in your browser. New games added regularly.
          </p>
        </div>
        <label className="shrink-0">
          <span className="sr-only">Game type</span>
          <select
            value={toValue(filter)}
            onChange={(e) => choose(e.target.value)}
            className="game-filter"
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "10px 36px 10px 14px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              minWidth: "200px",
            }}
          >
            <option value="all">All games ({games.length})</option>
            <optgroup label="Type">
              {types.map((t) => (
                <option key={t.id} value={`type:${t.id}`}>{t.name} ({t.count})</option>
              ))}
            </optgroup>
            {tags.length > 0 && (
              <optgroup label="Tag">
                {tags.map((t) => (
                  <option key={t.id} value={`tag:${t.id}`}>{t.name} ({t.count})</option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {shown.map((game) => (
          <GameCard key={game.href} {...game} featured={filter.kind === "all" && game.featured} />
        ))}
      </div>
    </>
  );
}
