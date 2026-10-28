// A tester preview inside the site: the preview build of one game from a pushed batch, with a bar on
// top that shows what changed and lets anyone with the lab passcode push the batch to the live site
// (after ticking "Are you sure?"). Links in /lab and on each note point here.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { isTester } from '@/lib/lab';
import { kitGame } from '@/lib/kitGames';
import LabLogin from '../../../LabLogin';
import TryBar from './TryBar';

export const metadata: Metadata = { title: 'Test preview', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Note = { id: string; game: string; heard: string | null; note: string | null; text: string; status: string };

export default async function TryPage({ params }: { params: Promise<{ batch: string; game: string }> }) {
  const { batch, game } = await params;
  if (!/^[\w-]{1,40}$/.test(batch) || !/^[\w-]{1,60}$/.test(game)) notFound();
  if (!(await isTester())) return <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px' }}><LabLogin /></main>;
  const notes: Note[] = await prisma.feedback
    .findMany({ where: { run: batch }, select: { id: true, game: true, heard: true, note: true, text: true, status: true }, orderBy: { createdAt: 'asc' } })
    .catch(() => []);
  const title = (id: string) => kitGame(id)?.title ?? id;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 73px)', minHeight: '480px' }}>
      <TryBar
        batch={batch}
        game={game}
        title={title(game)}
        notes={notes.filter((n) => n.status !== 'skipped' && n.status !== 'failed').map((n) => ({ ...n, gameTitle: title(n.game) }))}
      />
      <iframe src={`/proto/preview/${batch}/${game}.html`} title={`${title(game)} preview`} allow="autoplay; fullscreen" style={{ flex: 1, width: '100%', border: 0, background: '#000' }} />
    </div>
  );
}
