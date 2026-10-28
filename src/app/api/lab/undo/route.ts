import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dispatch, isTester, labDenied } from '@/lib/lab';

// POST /api/lab/undo { commit }   revert one pushed batch (a single claude-games commit) and re-ship its games.
export async function POST(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  const commit = typeof body?.commit === 'string' && /^[0-9a-f]{7,40}$/.test(body.commit) ? body.commit : null;
  if (!commit) return NextResponse.json({ error: 'Missing commit' }, { status: 400 });
  const r = await prisma.feedback.updateMany({ where: { commit, status: 'live' }, data: { status: 'undoing' } });
  if (!r.count) return NextResponse.json({ error: 'Nothing live from that push' }, { status: 409 });
  try {
    await dispatch('undo', commit);
  } catch (e) {
    await prisma.feedback.updateMany({ where: { commit, status: 'undoing' }, data: { status: 'live' } });
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
