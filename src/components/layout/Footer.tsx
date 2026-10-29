const LINKS = [
  { label: "About",        href: "/about" },
  { label: "Leaderboards", href: "/leaderboard" },
  { label: "Account",      href: "/account" },
  { label: "Terms",        href: "/terms" },
  { label: "Privacy",      href: "/privacy" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--ink-deep)" }}>
      <div
        className="max-w-7xl mx-auto px-6 py-8 font-label flex flex-wrap items-center justify-between gap-x-8 gap-y-4"
        style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-muted)" }}
      >
        <span className="font-display" style={{ fontSize: "22px", color: "var(--text)" }}>
          Second Monitor <span style={{ color: "var(--accent)" }}>Games</span>
        </span>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="smg-tab" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
        </nav>
        <span>© {year} · An Iron Fox Games production</span>
      </div>
      <div aria-hidden="true" style={{ display: "flex", height: "6px" }}>
        <div style={{ flex: 1, background: "var(--accent-red)" }} />
        <div style={{ flex: 1, background: "var(--accent)" }} />
        <div style={{ flex: 1, background: "var(--accent-blue)" }} />
      </div>
    </footer>
  );
}
