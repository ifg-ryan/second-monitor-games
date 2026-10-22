// Leaderboards for every Claude Games kit game (server component).
// Each board has an anchor (#<game id>) so games can link straight to it.
import { prisma } from '@/lib/prisma';
import { KIT_GAMES, kitUrl } from '@/lib/kitGames';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default async function KitLeaderboards({ userId }: { userId: string | null }) {
  const boards = await Promise.all(
    KIT_GAMES.map(async (game) => {
      try {
        const rows = await prisma.kitScore.findMany({
          where: { game: game.id },
          orderBy: [{ score: game.score.lowerIsBetter ? 'asc' : 'desc' }, { updatedAt: 'asc' }],
          take: 10,
          select: { playerId: true, name: true, score: true, isGuest: true },
        });
        return { game, rows, ok: true };
      } catch {
        return { game, rows: [], ok: false };
      }
    }),
  );

  return (
    <div style={{ display: 'grid', gap: '20px', marginBottom: '48px' }}>
      {boards.map(({ game, rows, ok }) => (
        <section key={game.id} id={game.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', scrollMarginTop: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>{game.icon ?? '🎮'}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.15rem', color: 'var(--text)' }}>{game.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Best {game.score.label} · {game.tag}</div>
              </div>
            </div>
            <a href={kitUrl(game.id)} style={{ background: game.accent ?? 'var(--accent)', color: '#0d0d18', fontWeight: 700, fontSize: '0.8rem', padding: '7px 14px', borderRadius: '8px', textDecoration: 'none' }}>
              Play →
            </a>
          </div>
          {!ok ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Leaderboard warming up. Check back soon.</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No scores yet. Be the first on the board!</div>
          ) : (
            rows.map((r, i) => {
              const me = userId && r.playerId === userId;
              return (
                <div key={r.playerId} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 120px', padding: '9px 20px', fontSize: '0.9rem', borderTop: i ? '1px solid var(--border)' : 'none', background: me ? 'var(--accent-dim)' : 'transparent', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{MEDAL[i + 1] ?? i + 1}</span>
                  <span style={{ fontWeight: me ? 700 : 500 }}>
                    {r.name}
                    {r.isGuest && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> · guest</span>}
                    {me && <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}> · you</span>}
                  </span>
                  <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{r.score.toLocaleString('en-US')}</span>
                </div>
              );
            })
          )}
        </section>
      ))}
    </div>
  );
}
