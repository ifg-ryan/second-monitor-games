// New games from a GDD: upload a design doc, then open it to push it to Claude. See src/lib/builds.ts.
import type { Metadata } from 'next';
import { isTester } from '@/lib/lab';
import LabLogin from '../LabLogin';
import BuildsList from './BuildsList';

export const metadata: Metadata = { title: 'New games', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function BuildsPage() {
  return <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 80px' }}>{(await isTester()) ? <BuildsList /> : <LabLogin />}</main>;
}
