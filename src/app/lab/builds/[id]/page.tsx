// One new game from a GDD: its test build, what Claude did and reused from the kit, and the buttons
// (Push to Claude, ask for changes, send to a power user, publish). See src/lib/builds.ts.
import type { Metadata } from 'next';
import { isPower, isTester } from '@/lib/lab';
import LabLogin from '../../LabLogin';
import BuildDetail from './BuildDetail';

export const metadata: Metadata = { title: 'New game', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isTester())) return <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px' }}><LabLogin /></main>;
  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <BuildDetail id={id} power={await isPower()} />
    </main>
  );
}
