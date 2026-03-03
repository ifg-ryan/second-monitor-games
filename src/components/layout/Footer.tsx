export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      {/* Iron Fox tri-color stripe separator */}
      <div style={{ display: "flex", height: "9px" }}>
        <div style={{ flex: 1, background: "#d4572a" }} />
        <div style={{ flex: 1, background: "#e8a838" }} />
        <div style={{ flex: 1, background: "#4a8fc4" }} />
      </div>

      <footer style={{ background: "#3b7ec4", color: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* ── Top row: brand + columns ────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand + blurb */}
            <div className="flex flex-col gap-3 md:col-span-1">
              <span
                style={{ fontFamily: "var(--font-dm-serif)", color: "#ffffff", fontSize: "1.1rem" }}
              >
                Second Monitor<span style={{ color: "#e8a838" }}> Games</span>
              </span>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.7, maxWidth: "280px", color: "rgba(255,255,255,0.75)" }}>
                Daily card games and puzzles for people who just want something
                quick to play on the side while they work. Snack-size challenges
                that reset every day — free, no account needed.
              </p>
            </div>

            {/* Games */}
            <div className="flex flex-col gap-3">
              <span
                style={{
                  fontSize:      "11px",
                  fontWeight:    700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color:         "rgba(255,255,255,0.5)",
                }}
              >
                Games
              </span>
              <nav className="flex flex-col gap-2">
                {[
                  { label: "The Escape", href: "/games/the-escape" },
                  { label: "Decode",     href: "/games/decode"     },
                  { label: "Block Fall", href: "/games/block-fall" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", textDecoration: "none" }}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Site */}
            <div className="flex flex-col gap-3">
              <span
                style={{
                  fontSize:      "11px",
                  fontWeight:    700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color:         "rgba(255,255,255,0.5)",
                }}
              >
                Site
              </span>
              <nav className="flex flex-col gap-2">
                {[
                  { label: "About",   href: "/about"   },
                  { label: "Archive", href: "/archive" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Account", href: "/account" },
                  { label: "Terms",   href: "/terms"   },
                  { label: "Privacy", href: "/privacy" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.875rem", textDecoration: "none" }}
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

          </div>

          {/* ── Bottom row: copyright + IFG credit ───────────────── */}
          <div
            style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "24px" }}
            className="flex flex-col md:flex-row items-center justify-between gap-3"
          >
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              © {year} Second Monitor Games. All rights reserved.
            </span>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
              An Iron Fox Games property · New puzzles every day at midnight UTC.
            </span>
          </div>

        </div>
      </footer>
    </>
  );
}
