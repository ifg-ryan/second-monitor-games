import { auth } from '@clerk/nextjs/server';
import KitLeaderboards from '@/components/game/KitLeaderboards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Leaderboards — Top Scores | Second Monitor Games',
  description: 'See the top scores across all Second Monitor Games. Only your personal best counts.',
};

export default async function LeaderboardPage() {
  const { userId } = await auth();

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-dm-serif)',
          fontSize: '2rem',
          color: 'var(--text)',
          marginBottom: '6px',
        }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Top scores across all games. Only your personal best counts.
        </p>
      </div>

      {/* Kit games: one board each, linkable as /leaderboard#<game id> */}
      <KitLeaderboards userId={userId ?? null} />

      {/* CTA for signed-out users */}
      {!userId && (
        <p style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
        }}>
          <a href="/sign-in" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </a>{' '}
          to save your scores and appear on the leaderboard.
        </p>
      )}

    </div>
  );
}
