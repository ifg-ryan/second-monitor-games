import type { Metadata } from "next";
import GameGrid, { type GridGame } from "@/components/game/GameGrid";
import Image from "next/image";
import { KIT_GAMES, kitUrl, type KitGame } from "@/lib/kitGames";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title:       "Free Card Games, Puzzles, Golf & Arcade for Your Second Monitor",
  description: "Quick free browser games built for work breaks: Solitaire, a card battler, a 3D golf driving range, a retro arcade shooter and daily puzzles. No sign-up needed.",
  alternates:  { canonical: "https://secondmonitorgames.com" },
  openGraph: {
    title:       "Second Monitor Games — Daily Card Games & Puzzles for Work Breaks",
    description: "Quick free browser games built for work breaks: card games, puzzles, golf and arcade.",
    url:         "https://secondmonitorgames.com",
    type:        "website",
  },
};

// The featured game's top 5 is read live; the rest of the page is static.
export const revalidate = 60;

// Card edge colour by game type, from the Iron Fox tri-colour.
const STRIPE: Record<string, string> = {
  arcade: "var(--accent)", strategy: "var(--accent)",
  card: "var(--accent-red)", puzzle: "var(--accent-red)",
  sports: "var(--accent-blue)", word: "var(--accent-blue)",
};

// Kit games come from public/proto/games.json (written by `npm run ship` in claude-games),
// newest first; shipping a game with a game.json adds its card here automatically.
// NEW marks only the few latest games (after the featured one), so it still means something.
const NEW_DAYS = 30;
const NEW_MAX = 4;
const isNew = (g: KitGame, i: number) => i > 0 && i <= NEW_MAX && !!g.added && Date.now() - Date.parse(g.added) < NEW_DAYS * 86400000;
const GAMES: GridGame[] = KIT_GAMES.map((g, i) => ({
  title: g.title,
  description: g.blurb,
  tag: g.tag,
  type: g.type,
  tags: g.tags,
  href: kitUrl(g.id),
  stripe: STRIPE[g.type ?? ""] ?? "var(--accent)",
  previewImage: g.preview,
  number: i + 1,
  minutes: g.minutes,
  featured: i === 0,
  isNew: isNew(g, i),
}));

const FEATURED = KIT_GAMES[0];

async function topFive(game: KitGame) {
  try {
    return await prisma.kitScore.findMany({
      where: { game: game.id },
      orderBy: [{ score: game.score.lowerIsBetter ? "asc" : "desc" }, { updatedAt: "asc" }],
      take: 5,
      select: { playerId: true, name: true, score: true },
    });
  } catch {
    return [];
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "14px 18px", background: "var(--ink-deep)", border: "1px solid var(--border)" }}>
      <span className="font-label" style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
      <span className="font-display" style={{ fontSize: "28px", color: "var(--accent)", lineHeight: 1.1 }}>{value}</span>
    </div>
  );
}

export default async function Home() {
  const rows = FEATURED ? await topFive(FEATURED) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "ItemList",
    "name":     "Free Browser Games",
    "url":      "https://secondmonitorgames.com",
    "itemListElement": GAMES.map((g, n) => ({ "@type": "ListItem", "position": n + 1, "name": `${g.title} — ${g.tag}`, "url": `https://secondmonitorgames.com${g.href}` })),
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20" style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {FEATURED && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
          {/* Featured game */}
          <section style={{ flex: "999 1 620px", minWidth: 0, position: "relative", background: "var(--surface)", aspectRatio: "16 / 9", overflow: "hidden" }}>
            {FEATURED.preview && (
              <Image src={FEATURED.preview} alt={`${FEATURED.title} gameplay preview`} fill priority sizes="(max-width: 1024px) 100vw, 66vw" style={{ objectFit: "cover", opacity: 0.85 }} />
            )}
            <div
              style={{
                position: "absolute", left: 0, right: 0, bottom: 0, padding: "140px 32px 32px",
                background: "linear-gradient(0deg, rgba(13,24,18,0.97) 0%, rgba(13,24,18,0.88) 45%, rgba(13,24,18,0) 100%)",
                display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-end", justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
                <span className="font-label" style={{ fontSize: "18px", color: "var(--accent)", letterSpacing: "0.16em" }}>01 · Headliner</span>
                <h1 className="font-display" style={{ margin: 0, fontSize: "clamp(56px, 8vw, 112px)", lineHeight: 0.9 }}>{FEATURED.title}</h1>
              </div>
              <a
                href={kitUrl(FEATURED.id)}
                className="font-display smg-play"
                style={{ textDecoration: "none", background: "var(--accent)", color: "var(--bg)", padding: "16px 40px", fontSize: "28px" }}
              >
                Play
              </a>
            </div>
          </section>

          {/* Featured game's leaderboard */}
          <aside style={{ flex: "1 1 320px", background: "var(--surface)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 className="font-display" style={{ margin: 0, fontSize: "30px" }}>
              Top 5 <span style={{ color: "var(--accent)" }}>All time</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {rows.length === 0 ? (
                <p className="font-label" style={{ margin: 0, padding: "16px 0", borderTop: "1px solid var(--border)", fontSize: "18px", color: "var(--text-muted)" }}>
                  Board is open. Post the first score.
                </p>
              ) : (
                rows.map((r, i) => (
                  <div key={r.playerId} style={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr) auto", gap: "12px", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border)" }}>
                    <span className="font-display" style={{ fontSize: "24px", color: i === 0 ? "var(--accent)" : "var(--text-muted)" }}>{i + 1}</span>
                    <span className="font-label" style={{ fontSize: "19px", fontWeight: 600, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                    <span className="font-display" style={{ fontSize: "22px", color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{r.score.toLocaleString("en-US")}</span>
                  </div>
                ))
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px", marginTop: "auto" }}>
              {FEATURED.minutes && <Stat label="Length" value={`${FEATURED.minutes[0]}–${FEATURED.minutes[1]} min`} />}
              <Stat label="Type" value={FEATURED.tag} />
            </div>
            <a href={`/leaderboard#${FEATURED.id}`} className="font-label smg-tab" style={{ color: "var(--text)", textDecoration: "none", fontSize: "16px" }}>
              All leaderboards →
            </a>
          </aside>
        </div>
      )}

      <GameGrid games={GAMES} />
    </div>
  );
}
