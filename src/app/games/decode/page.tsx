export const metadata = {
  title:       "Decode — Free Daily Word Puzzle",
  description: "Guess the five-letter word in six tries. Free daily word puzzle — new challenge every day, no subscription needed. Play online now.",
  keywords:    ["daily word puzzle", "free word puzzle game", "five letter word puzzle", "word guessing game", "daily brain puzzle", "free puzzle game online", "word puzzle like Wordle"],
  alternates:  { canonical: "https://secondmonitorgames.com/games/decode" },
  openGraph: {
    title:       "Decode — Free Daily Word Puzzle",
    description: "Guess the five-letter word in six tries. New puzzle every day — free, no subscription needed.",
    url:         "https://secondmonitorgames.com/games/decode",
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Decode — Free Daily Word Puzzle",
    description: "Guess the five-letter word in six tries. New puzzle every day — free.",
  },
};

function getTodayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function DecodePage() {
  const today = getTodayLabel();

  const jsonLd = {
    "@context":           "https://schema.org",
    "@type":              "VideoGame",
    "name":               "Decode",
    "description":        "A free daily five-letter word puzzle game. Guess the word in six tries — green for correct, yellow for wrong position, grey for not in word. New puzzle every day.",
    "url":                "https://secondmonitorgames.com/games/decode",
    "applicationCategory": "Game",
    "genre":              ["Puzzle", "Word Game", "Brain Game"],
    "gamePlatform":       "Web Browser",
    "operatingSystem":    "Any",
    "offers": {
      "@type":         "Offer",
      "price":         "0",
      "priceCurrency": "USD",
    },
    "publisher": {
      "@type": "Organization",
      "name":  "Second Monitor Games",
      "url":   "https://secondmonitorgames.com",
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            Decode
          </span>
          <span
            style={{
              background: "rgba(83, 141, 78, 0.15)",
              color: "#538d4e",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 7px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            Word Game
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
        src="/games/decode.html"
        title="Decode"
        style={{
          width: "100%",
          flex: 1,
          border: "none",
          display: "block",
          background: "#121213",
        }}
        allowFullScreen
      />
    </div>
  );
}
