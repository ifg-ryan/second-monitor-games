import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BUSY, cancelRun, isTester, labDenied } from '@/lib/lab';

// POST /api/lab/stop { ids }   stop work on these notes: cancel their GitHub run (if one is going)
// and put each note back where a person can act on it. A run that is cancelled mid-way
// can no longer write results back (the runner only updates notes that are still busy).
//   queued / working -> inbox ("new")    approving / rejecting -> review    undoing -> live
const BACK: Record<string, string> = { queued: 'new', working: 'new', approving: 'review', rejecting: 'review', undoing: 'live' };

export async function POST(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string').slice(0, 100) : [];
  if (!ids.length) return NextResponse.json({ error: 'Nothing to stop' }, { status: 400 });
  const items: { id: string; status: string; run: string | null }[] = await prisma.feedback.findMany({ where: { id: { in: ids }, status: { in: BUSY } }, select: { id: true, status: true, run: true } });
  if (!items.length) return NextResponse.json({ error: 'Nothing running' }, { status: 409 });

  // Cancel the GitHub runs these notes belong to. Notes still queued have no run id yet; their run will find nothing to claim.
  const runs = [...new Set(items.filter((i) => i.status !== 'queued' && i.run && /^\d+$/.test(i.run)).map((i) => i.run as string))];
  const cancelled = await Promise.all(runs.map((r) => cancelRun(r).then(() => true, () => false)));

  for (const i of items) {
    await prisma.feedback.updateMany({ where: { id: i.id, status: i.status }, data: { status: BACK[i.status] ?? 'new', note: 'Stopped' } });
  }
  return NextResponse.json({ ok: true, stopped: items.length, runsCancelled: cancelled.filter(Boolean).length });
}
