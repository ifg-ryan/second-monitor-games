export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        color: "var(--text-muted)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span
            style={{ fontFamily: "var(--font-dm-serif)", color: "var(--text)" }}
            className="text-base"
          >
            Second Monitor<span style={{ color: "var(--accent)" }}> Games</span>
          </span>
          <span className="text-xs">
            © {year} Second Monitor Games. All rights reserved.
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          {[
            { label: "Today's Games", href: "/" },
            { label: "Archive", href: "/archive" },
            { label: "Pricing", href: "/pricing" },
            { label: "About", href: "/about" },
            { label: "Terms", href: "/terms" },
            { label: "Privacy", href: "/privacy" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ color: "var(--text-muted)" }}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

      </div>
    </footer>
  );
}
