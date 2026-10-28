import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanText, runnerProblem } from '@/lib/lab';
import { BUILD_BUSY, BUILD_RESULTS, addLog } from '@/lib/builds';

// Used only by the claude-games workflow (GitHub OIDC token, see runnerProblem) for GDD builds.
//   GET  ?id=<build>&run=<run>&claim=1   the build (no file; that is /api/lab/builds/file). With claim, a queued
//                                       build becomes "working" for this run.
//   POST { id, run, status, note?, preview?, commit?, slug?, version?, reuse? }   write back. Only builds still in
//        progress are updated, so a stopped run can't overwrite them.
const SHA = /^[0-9a-f]{7,40}$/;

export async function GET(request: Request) {
  const problem = await runnerProblem(request);
  if (problem) return NextResponse.json({ error: `Runner only: ${problem}` }, { status: 401 });
  const p = new URL(request.url).searchParams;
  const id = p.get('id') ?? '';
  const b = await prisma.gameBuild.findUnique({ where: { id }, select: { id: true, title: true, slug: true, fileName: true, notes: true, request: true, status: true, versions: true, log: true, commit: true } });
  if (!b) return NextResponse.json({ error: 'No such build' }, { status: 404 });
  if (p.get('claim') && b.status === 'queued') {
    await prisma.gameBuild.updateMany({ where: { id, status: 'queued' }, data: { status: 'working', run: p.get('run') ?? 'manual' } });
    b.status = 'working';
  }
  return NextResponse.json({ build: b });
}

export async function POST(request: Request) {
  const problem = await runnerProblem(request);
  if (problem) return NextResponse.json({ error: `Runner only: ${problem}` }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = typeof body?.id === 'string' ? body.id : '';
  const status = String(body?.status ?? '');
  if (!BUILD_RESULTS.includes(status as never)) return NextResponse.json({ error: 'Bad status' }, { status: 400 });
  const b = await prisma.gameBuild.findUnique({ where: { id }, select: { log: true, versions: true } });
  if (!b) return NextResponse.json({ error: 'No such build' }, { status: 404 });
  const data: Record<string, unknown> = { status };
  if ('note' in body) data.note = cleanText(body.note, 2000);
  if (typeof body.preview === 'string' && /^\/proto\/preview\/[\w-]+\/[\w-]+\.html$/.test(body.preview)) data.preview = body.preview;
  if (typeof body.commit === 'string' && SHA.test(body.commit)) data.commit = body.commit;
  if (typeof body.slug === 'string' && /^[a-z0-9-]{1,60}$/.test(body.slug)) data.slug = body.slug;
  if (Number.isInteger(body.version) && body.version > b.versions) data.versions = body.version;
  if (body.reuse && typeof body.reuse === 'object') {
    const list = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => x.slice(0, 200)).slice(0, 80) : []);
    const num = (v: unknown) => (Number.isFinite(v) ? Math.round(v as number) : null);
    const r = body.reuse;
    data.reuse = JSON.stringify({ plan: cleanText(r.plan, 8000), reused: list(r.reused), added: list(r.added), candidates: list(r.candidates), gameLines: num(r.gameLines), kitLines: num(r.kitLines) });
  }
  if (status === 'review') data.request = null;
  const event = status === 'review' ? `version ${body.version ?? b.versions} ready to test` : status === 'live' ? 'live on the site' : status === 'failed' ? 'build failed' : status;
  data.log = addLog(b.log, event, typeof data.note === 'string' ? data.note : undefined);
  const r = await prisma.gameBuild.updateMany({ where: { id, status: { in: BUILD_BUSY } }, data });
  return NextResponse.json({ ok: true, updated: r.count });
}
