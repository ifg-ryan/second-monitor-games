export const metadata = {
  title: "Tetris — Second Monitor Games",
  description: "Play today's Tetris. A new game every day on Second Monitor Games.",
};

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function TetrisPage() {
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
            Tetris
          </span>
          <span
            style={{
              background: "rgba(0, 200, 255, 0.12)",
              color: "#00c8ff",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 7px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            Arcade
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
        src="/games/tetris.html"
        title="Tetris"
        style={{
          width: "100%",
          flex: 1,
          border: "none",
          display: "block",
          background: "#1a1a2e",
        }}
        allowFullScreen
      />
    </div>
  );
}
