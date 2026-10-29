import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import AccountButton from "@/components/layout/AccountButton";
import { KIT_GAMES, kitUrl } from "@/lib/kitGames";

const NEW_DAYS = 30;

// Ticker: the newest games, then the daily ones, then the game count.
function tickerItems() {
  const now = Date.now();
  const fresh = KIT_GAMES.filter((g) => g.added && now - Date.parse(g.added) < NEW_DAYS * 86400000).slice(0, 5);
  const daily = KIT_GAMES.filter((g) => g.tags?.includes("daily"));
  return [
    ...fresh.map((g) => ({ label: "New", title: g.title, href: kitUrl(g.id) })),
    ...daily.map((g) => ({ label: "Daily", title: g.title, href: kitUrl(g.id) })),
    { label: `${KIT_GAMES.length} games`, title: "on the board", href: "/" },
  ];
}

function Ticker() {
  const items = tickerItems();
  const run = (hidden: boolean) => (
    <span aria-hidden={hidden || undefined} style={{ display: "inline-flex", alignItems: "center" }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
          <a href={it.href} tabIndex={hidden ? -1 : undefined} style={{ color: "var(--text)", textDecoration: "none", padding: "0 18px" }}>
            <span style={{ color: "var(--accent)" }}>{it.label}:</span> {it.title}
          </a>
          <span aria-hidden="true" style={{ color: "var(--accent-red)" }}>◆</span>
        </span>
      ))}
    </span>
  );
  return (
    <div
      className="smg-ticker font-label"
      style={{ background: "var(--ink-deep)", borderBottom: "1px solid var(--border)", fontSize: "15px", padding: "7px 0", overflow: "hidden", whiteSpace: "nowrap" }}
    >
      <div className="smg-ticker-track">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}

const navLink: React.CSSProperties = { color: "var(--text)", textDecoration: "none", padding: "10px 14px" };

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50" style={{ background: "var(--bg)" }}>
      {/* Iron Fox tri-color stripe */}
      <div aria-hidden="true" style={{ display: "flex", height: "6px" }}>
        <div style={{ flex: 1, background: "var(--accent-red)" }} />
        <div style={{ flex: 1, background: "var(--accent)" }} />
        <div style={{ flex: 1, background: "var(--accent-blue)" }} />
      </div>

      <Ticker />

      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link href="/" className="font-display" style={{ color: "var(--text)", textDecoration: "none", fontSize: "28px", lineHeight: 1 }}>
            Second Monitor <span style={{ color: "var(--accent)" }}>Games</span>
          </Link>

          <nav className="font-label flex flex-wrap items-center gap-1" style={{ fontSize: "17px" }}>
            <Link href="/" className="smg-tab" style={navLink}>Games</Link>
            <a href="/leaderboard" className="smg-tab" style={navLink}>Leaderboards</a>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="font-label smg-tab"
                  style={{ fontSize: "17px", color: "var(--accent)", background: "none", border: "2px solid var(--accent)", padding: "8px 16px", marginLeft: "8px", cursor: "pointer" }}
                >
                  Log in
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <span style={{ marginLeft: "8px" }}><AccountButton /></span>
            </SignedIn>
          </nav>
        </div>
      </header>
    </div>
  );
}
