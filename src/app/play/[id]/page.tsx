// A kit game inside the site: the site's top bar, a slim info bar (back, title, leaderboard), and the game.
// Games themselves are self-contained pages in public/proto/ (shipped by claude-games `npm run ship`).
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { KIT_GAMES, kitGame, kitFile } from '@/lib/kitGames';
import KitGameFrame from '@/components/game/KitGameFrame';
import FeedbackButton from '@/components/lab/FeedbackButton';

export function generateStaticParams() {
  return KIT_GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const g = kitGame((await params).id);
  if (!g) return {};
  return {
    title: `${g.title}: Free Quick Browser Game`,
    description: g.blurb,
    alternates: { canonical: `https://secondmonitorgames.com/play/${g.id}` },
    openGraph: { title: g.title, description: g.blurb, url: `https://secondmonitorgames.com/play/${g.id}`, type: 'website', images: g.preview ? [g.preview] : undefined },
  };
}

const link = { fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' } as const;

export default async function PlayPage({ params }: { params: Promise<{ id: string }> }) {
  const g = kitGame((await params).id);
  if (!g) notFound();
  const accent = g.accent ?? 'var(--accent)';
  const minutes = g.minutes ? `${g.minutes[0]}-${g.minutes[1]} min` : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 73px)', minHeight: '420px' }}>
      <div
        style={{
          minHeight: '48px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '6px 24px',
          flexShrink: 0,
        }}
      >
        <a href="/" className="nav-link-muted" style={{ ...link, fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All games
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ fontSize: '1.1rem' }}>{g.icon}</span>
          <span style={{ fontFamily: 'var(--font-dm-serif)', color: 'var(--text)', fontSize: '1rem', whiteSpace: 'nowrap' }}>{g.title}</span>
          <span style={{ border: `1px solid ${accent}`, color: 'var(--text)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{g.tag}</span>
          <span className="hidden lg:inline" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '420px' }} title={g.blurb}>
            {g.blurb}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', whiteSpace: 'nowrap' }}>
          <FeedbackButton game={g.id} build={g.source} />
          {minutes && <span className="hidden md:inline" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{minutes}</span>}
          <a href={`/leaderboard#${g.id}`} style={{ ...link, color: 'var(--accent)' }}>🏆 Leaderboard</a>
          <a href="/account" className="nav-link-muted hidden sm:inline" style={link}>Achievements</a>
          <a href={kitFile(g.id)} target="_blank" rel="noopener" className="nav-link-muted hidden md:inline" style={link} title="Open the game on its own, full window">Pop out ↗</a>
        </div>
      </div>
      <KitGameFrame src={kitFile(g.id)} title={g.title} />
    </div>
  );
}
