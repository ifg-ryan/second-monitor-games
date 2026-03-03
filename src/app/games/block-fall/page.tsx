import BlockFallClient from './BlockFallClient';

export const metadata = {
  title:       "Block Fall — Free Quick Arcade Game for Work Breaks",
  description: "The classic block-stacking game, free to play in your browser. Beat your daily high score in minutes. Perfect for a quick break on your second monitor — no download needed.",
  keywords:    ["block fall game", "quick arcade game", "block game at work", "browser game no download", "second monitor arcade game", "free game work break", "fast arcade puzzle"],
  alternates:  { canonical: "https://secondmonitorgames.com/games/block-fall" },
  openGraph: {
    title:       "Block Fall — Free Quick Arcade Game for Work Breaks",
    description: "Classic block-stacking game, free in your browser. Beat your daily high score — perfect for a quick break on your second monitor.",
    url:         "https://secondmonitorgames.com/games/block-fall",
    type:        "website",
  },
};

function getTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlockFallPage() {
  const today = getTodayLabel();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>

      {/* ── Game info bar ───────────────────────────────────── */}
      <div
        style={{
          height: '48px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
        }}
      >
        {/* Back */}
        <a
          href="/"
          className="nav-link-muted"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Today&apos;s Games
        </a>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontFamily: 'var(--font-dm-serif)',
              color: 'var(--text)',
              fontSize: '1rem',
            }}
          >
            Block Fall
          </span>
          <span
            style={{
              background: 'rgba(0, 200, 255, 0.12)',
              color: '#00c8ff',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '2px 7px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            Arcade
          </span>
        </div>

        {/* Right side — date + leaderboard link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a
            href="/leaderboard"
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--accent)',
              textDecoration: 'none',
              opacity: 0.85,
            }}
          >
            🏆 Leaderboard
          </a>
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
            }}
          >
            {today}
          </span>
        </div>
      </div>

      {/* ── Game (client component handles iframe + postMessage) ── */}
      <BlockFallClient />
    </div>
  );
}
