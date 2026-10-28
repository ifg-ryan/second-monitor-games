import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RUNNER_RESULTS, cleanText, isRunner } from '@/lib/lab';

// Used only by the claude-games feedback workflow (Authorization: Bearer LAB_RUNNER_KEY).
//   GET  ?run=<id>       claim every queued note (they become "working", batch = run) and return them
//   GET  ?batch=<id>     the notes in a batch (for Approve / Send back)
//   GET  ?commit=<sha>   the notes a live commit applied (for Undo)
//   POST { run, commit?, results: [{ id, status, note?, heard?, transcript? }] }   write back what happened.
//        Fields left out are not changed.
const denied = () => NextResponse.json({ error: 'Runner only' }, { status: 401 });
const select = { id: true, game: true, text: true, context: true, audioType: true, status: true, createdAt: true } as const;
type Row = { id: string; audioType: string | null } & Record<string, unknown>;
const shape = (rows: Row[]) => rows.map(({ audioType, ...r }) => ({ ...r, hasAudio: !!audioType }));
const SHA = /^[0-9a-f]{7,40}$/;

export async function GET(request: Request) {
  if (!isRunner(request)) return denied();
  const params = new URL(request.url).searchParams;
  const commit = params.get('commit');
  const batch = params.get('batch');
  if (commit) return NextResponse.json({ items: shape(await prisma.feedback.findMany({ where: { commit }, select })) });
  if (batch) return NextResponse.json({ items: shape(await prisma.feedback.findMany({ where: { run: batch }, select })) });
  const run = params.get('run') ?? 'manual';
  const rows: Row[] = await prisma.feedback.findMany({ where: { status: 'queued' }, orderBy: { createdAt: 'asc' }, select });
  if (rows.length) await prisma.feedback.updateMany({ where: { id: { in: rows.map((i) => i.id) }, status: 'queued' }, data: { status: 'working', run } });
  return NextResponse.json({ items: shape(rows) });
}

export async function POST(request: Request) {
  if (!isRunner(request)) return denied();
  const body = await request.json().catch(() => ({}));
  const results: Record<string, unknown>[] = Array.isArray(body?.results) ? body.results : [];
  const commit = typeof body?.commit === 'string' && SHA.test(body.commit) ? body.commit : null;
  let updated = 0;
  for (const r of results) {
    if (typeof r.id !== 'string' || !RUNNER_RESULTS.includes(r.status as never)) continue;
    const status = r.status as string;
    const data: Record<string, unknown> = { status };
    if ('note' in r) data.note = cleanText(r.note, 500);
    if ('heard' in r) data.heard = cleanText(r.heard, 1000);
    if ('transcript' in r) data.transcript = cleanText(r.transcript);
    if ((status === 'review' || status === 'live') && commit) data.commit = commit;
    await prisma.feedback.update({ where: { id: r.id }, data }).catch(() => null);
    updated++;
  }
  return NextResponse.json({ ok: true, updated });
}
