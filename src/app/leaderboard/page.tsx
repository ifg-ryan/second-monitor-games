import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Leaderboard — Second Monitor Games',
  description: 'Top scores across all Second Monitor Games.',
};

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function formatScore(n: number) {
  return n.toLocaleString('en-US');
}

export default async function LeaderboardPage() {
  const { userId } = await auth();

  const scores = await prisma.leaderboardScore.findMany({
    where: { game: 'tetris' },
    orderBy: { score: 'desc' },
    take: 20,
    select: {
      id: true,
      userId: true,
      userName: true,
      score: true,
      lines: true,
      level: true,
    },
  });

  // If current user is logged in but not in top 20, fetch their best
  let myEntry: typeof scores[0] | null = null;
  let myRank: number | null = null;
  if (userId) {
    const inTop = scores.findIndex((s) => s.userId === userId);
    if (inTop === -1) {
      const personal = await prisma.leaderboardScore.findUnique({
        where: { game_userId: { game: 'tetris', userId } },
        select: { id: true, userId: true, userName: true, score: true, lines: true, level: true },
      });
      if (personal) {
        myEntry = personal;
        myRank = await prisma.leaderboardScore.count({
          where: { game: 'tetris', score: { gt: personal.score } },
        }) + 1;
      }
    }
  }

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

      {/* Game Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0',
      }}>
        {/* Active tab */}
        <div style={{
          padding: '8px 18px',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--accent)',
          borderBottom: '2px solid var(--accent)',
          marginBottom: '-1px',
          cursor: 'default',
        }}>
          Tetris
        </div>
        {/* Coming Soon */}
        <div style={{
          padding: '8px 18px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          opacity: 0.5,
          cursor: 'not-allowed',
        }}>
          The Escape <span style={{ fontSize: '0.7rem' }}>(coming soon)</span>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr 110px 70px 70px',
          padding: '10px 20px',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border)',
        }}>
          <span>#</span>
          <span>Player</span>
          <span style={{ textAlign: 'right' }}>Score</span>
          <span style={{ textAlign: 'right' }}>Level</span>
          <span style={{ textAlign: 'right' }}>Lines</span>
        </div>

        {scores.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
          }}>
            No scores yet — play Tetris to be the first on the board!
          </div>
        ) : (
          scores.map((entry, i) => {
            const rank = i + 1;
            const isMe = entry.userId === userId;
            return (
              <div
                key={entry.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 110px 70px 70px',
                  padding: '13px 20px',
                  fontSize: '0.875rem',
                  borderBottom: i < scores.length - 1 ? '1px solid var(--border)' : 'none',
                  background: isMe ? 'rgba(232, 168, 56, 0.07)' : 'transparent',
                  borderLeft: isMe ? '3px solid var(--accent)' : '3px solid transparent',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
              >
                {/* Rank */}
                <span style={{
                  fontWeight: 700,
                  fontSize: rank <= 3 ? '1rem' : '0.8rem',
                  color: rank <= 3 ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {MEDAL[rank] ?? `#${rank}`}
                </span>

                {/* Name */}
                <span style={{
                  fontWeight: isMe ? 700 : 500,
                  color: isMe ? 'var(--accent)' : 'var(--text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {entry.userName}
                  {isMe && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      background: 'var(--accent)',
                      color: '#0d0d18',
                      borderRadius: '4px',
                      padding: '1px 5px',
                    }}>
                      You
                    </span>
                  )}
                </span>

                {/* Score */}
                <span style={{
                  textAlign: 'right',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {formatScore(entry.score)}
                </span>

                {/* Level */}
                <span style={{
                  textAlign: 'right',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                }}>
                  {entry.level}
                </span>

                {/* Lines */}
                <span style={{
                  textAlign: 'right',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                }}>
                  {entry.lines}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Current user's score if outside top 20 */}
      {myEntry && myRank && (
        <div style={{
          marginTop: '16px',
          padding: '14px 20px',
          background: 'rgba(232, 168, 56, 0.07)',
          border: '1px solid var(--accent)',
          borderRadius: '10px',
          display: 'grid',
          gridTemplateColumns: '48px 1fr 110px 70px 70px',
          fontSize: '0.875rem',
          alignItems: 'center',
          borderLeft: '3px solid var(--accent)',
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            #{myRank}
          </span>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
            {myEntry.userName}
            <span style={{
              marginLeft: '8px',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'var(--accent)',
              color: '#0d0d18',
              borderRadius: '4px',
              padding: '1px 5px',
            }}>
              You
            </span>
          </span>
          <span style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
            {formatScore(myEntry.score)}
          </span>
          <span style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {myEntry.level}
          </span>
          <span style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {myEntry.lines}
          </span>
        </div>
      )}

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

      {/* Play Tetris CTA */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <a
          href="/games/tetris"
          style={{
            display: 'inline-block',
            background: 'var(--accent)',
            color: '#0d0d18',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '10px 24px',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
        >
          Play Tetris →
        </a>
      </div>

    </div>
  );
}
