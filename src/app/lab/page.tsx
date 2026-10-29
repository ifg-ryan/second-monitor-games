// The tester lab (hidden, not linked anywhere): feedback testers dictated while playing,
// waiting to be pushed. Push has Claude apply the notes and re-ship the games. See src/lib/lab.ts.
import type { Metadata } from 'next';
import { isTester } from '@/lib/lab';
import { KIT_GAMES } from '@/lib/kitGames';
import LabLogin from './LabLogin';
import LabQueue from './LabQueue';

export const metadata: Metadata = { title: 'Lab', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function LabPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const pick = (await searchParams).game;
  const games = KIT_GAMES.map((g) => ({ id: g.id, title: g.title, icon: g.icon ?? '🎮', build: g.source }));
  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {(await isTester()) ? <LabQueue games={games} initialGame={games.some((g) => g.id === pick) ? pick : undefined} /> : <LabLogin />}
    </main>
  );
}
