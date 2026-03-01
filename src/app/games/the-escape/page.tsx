export const metadata = {
  title: "The Escape — Second Monitor Games",
  description: "Play today's The Escape. A dark card strategy game on Second Monitor Games.",
};

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function TheEscapePage() {
  const today = getTodayLabel();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>

      {/* ── Game info bar ───────────────────────────────────── */}
      <div
        style={{
          height: "48px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        {/* Back */}
        <a
          href="/"
          className="nav-link-muted"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Today&apos;s Games
        </a>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text)",
              fontSize: "1rem",
            }}
          >
            The Escape
          </span>
          <span
            style={{
              background: "rgba(201, 168, 76, 0.15)",
              color: "#c9a84c",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 7px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            Card Strategy
          </span>
        </div>

        {/* Date */}
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
          }}
        >
          {today}
        </span>
      </div>

      {/* ── Game iframe ─────────────────────────────────────── */}
      <iframe
        src="/games/the-escape.html"
        title="The Escape"
        style={{
          width: "100%",
          flex: 1,
          border: "none",
          display: "block",
          background: "#0a0a0f",
        }}
        allowFullScreen
      />
    </div>
  );
}
