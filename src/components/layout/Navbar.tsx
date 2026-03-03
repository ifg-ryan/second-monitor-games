import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AccountButton from "@/components/layout/AccountButton";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50">
      {/* Iron Fox tri-color stripe */}
      <div style={{ display: "flex", height: "9px" }}>
        <div style={{ flex: 1, background: "#d4572a" }} />
        <div style={{ flex: 1, background: "#e8a838" }} />
        <div style={{ flex: 1, background: "#4a8fc4" }} />
      </div>

      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div
              style={{ background: "var(--accent)", borderRadius: "6px" }}
              className="w-7 h-7 flex items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="#d4572a" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="#e8a838" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="#4a8fc4" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="#ffffff" opacity="0.5" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-dm-serif)",
                color: "var(--text)",
              }}
              className="text-lg tracking-wide"
            >
              Second Monitor
              <span style={{ color: "var(--accent)" }}> Games</span>
            </span>
          </a>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="/"
              style={{
                color: "var(--text)",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "8px 16px",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              className="hover:bg-black/5 dark:hover:bg-white/5"
            >
              Today&apos;s Games
            </a>
            <a
              href="/archive"
              className="nav-link-muted"
              style={{
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              Archive
            </a>
            <a
              href="/leaderboard"
              className="nav-link-muted"
              style={{
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              🏆 Leaderboard
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="hidden sm:block nav-link-muted"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Log in
                </button>
              </SignInButton>
              <a
                href="/pricing"
                style={{
                  background: "var(--accent)",
                  color: "#0d0d18",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  padding: "8px 16px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s",
                }}
                className="hover:opacity-90"
              >
                Subscribe — $4.99/mo
              </a>
            </SignedOut>
            <SignedIn>
              <AccountButton />
            </SignedIn>
            <ThemeToggle />
          </div>

        </div>
      </header>
    </div>
  );
}
