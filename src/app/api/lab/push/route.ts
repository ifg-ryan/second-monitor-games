import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PUSHABLE, dispatch, isTester, labDenied } from '@/lib/lab';

// POST /api/lab/push { ids }   queue these notes and start the claude-games feedback workflow.
// Runs queue up on GitHub one at a time, so pushing again while one is working is fine.
export async function POST(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string').slice(0, 50) : [];
  if (!ids.length) return NextResponse.json({ error: 'Pick some notes first' }, { status: 400 });
  const r = await prisma.feedback.updateMany({ where: { id: { in: ids }, status: { in: PUSHABLE } }, data: { status: 'queued', note: null } });
  if (!r.count) return NextResponse.json({ error: 'Nothing to push' }, { status: 409 });
  try {
    await dispatch('apply');
  } catch (e) {
    await prisma.feedback.updateMany({ where: { id: { in: ids }, status: 'queued' }, data: { status: 'failed', note: `Could not start: ${(e as Error).message}` } });
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
  return NextResponse.json({ ok: true, queued: r.count });
}
