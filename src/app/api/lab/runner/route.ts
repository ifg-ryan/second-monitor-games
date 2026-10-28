import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RUNNER_RESULTS, cleanText, isRunner } from '@/lib/lab';

// Used only by the claude-games feedback workflow (Authorization: Bearer LAB_RUNNER_KEY).
//   GET  ?run=<id>               claim every queued note (they become "working") and return them
//   GET  ?commit=<sha>           the notes a pushed commit applied (for Undo)
//   POST { run, commit?, results: [{ id, status, note? }] }   write back what happened
const denied = () => NextResponse.json({ error: 'Runner only' }, { status: 401 });
const select = { id: true, game: true, text: true, context: true, createdAt: true } as const;

export async function GET(request: Request) {
  if (!isRunner(request)) return denied();
  const params = new URL(request.url).searchParams;
  const commit = params.get('commit');
  if (commit) {
    const items = await prisma.feedback.findMany({ where: { commit }, select });
    return NextResponse.json({ items });
  }
  const run = params.get('run') ?? 'manual';
  const items = await prisma.feedback.findMany({ where: { status: 'queued' }, orderBy: { createdAt: 'asc' }, select });
  if (items.length) await prisma.feedback.updateMany({ where: { id: { in: items.map((i: { id: string }) => i.id) }, status: 'queued' }, data: { status: 'working', run } });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!isRunner(request)) return denied();
  const body = await request.json().catch(() => ({}));
  const results: { id?: unknown; status?: unknown; note?: unknown }[] = Array.isArray(body?.results) ? body.results : [];
  const run = typeof body?.run === 'string' ? body.run : null;
  const commit = typeof body?.commit === 'string' && /^[0-9a-f]{7,40}$/.test(body.commit) ? body.commit : null;
  let updated = 0;
  for (const r of results) {
    if (typeof r.id !== 'string' || !RUNNER_RESULTS.includes(r.status as never)) continue;
    const status = r.status as string;
    await prisma.feedback.update({
      where: { id: r.id },
      data: { status, note: cleanText(r.note, 500), ...(run ? { run } : {}), ...(status === 'live' && commit ? { commit } : {}) },
    }).catch(() => null);
    updated++;
  }
  return NextResponse.json({ ok: true, updated });
}
