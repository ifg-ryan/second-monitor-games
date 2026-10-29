import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import AccountButton from "@/components/layout/AccountButton";

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
