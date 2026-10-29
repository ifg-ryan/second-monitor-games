// The Kit browser: every piece of the Claude Games kit, searchable, for testers writing a GDD or a note.
// Data: lab-data/kit-catalog.json, written by claude-games `npm run ship` (scripts/lab-catalog.mjs).
// Behind the lab passcode, since the kit itself is private.
import type { Metadata } from 'next';
import { isTester } from '@/lib/lab';
import catalog from '../../../../lab-data/kit-catalog.json';
import { KIT_GAMES } from '@/lib/kitGames';
import LabLogin from '../LabLogin';
import KitBrowser, { type KitCatalog } from './KitBrowser';

export const metadata: Metadata = { title: 'Kit', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const gameTitles: Record<string, string> = Object.fromEntries(KIT_GAMES.map((g) => [g.id, g.title]));

export default async function KitPage({ searchParams }: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const { q = '', tab } = await searchParams;
  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {(await isTester()) ? <KitBrowser catalog={catalog as unknown as KitCatalog} initialQuery={q} initialTab={tab === 'art' ? 'art' : 'pieces'} gameTitles={gameTitles} /> : <LabLogin />}
    </main>
  );
}
