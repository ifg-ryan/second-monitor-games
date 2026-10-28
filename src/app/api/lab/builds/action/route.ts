import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cancelRun, cleanText, dispatch, isPower, isTester, labDenied } from '@/lib/lab';
import { BUILD_BUSY, BUILD_PUSHABLE, addLog } from '@/lib/builds';

// POST /api/lab/builds/action { id, action, text? }
//   push      start Claude on it: the first build, or a new version with `text` as the change request
//   send      ask a power user to publish it            unsend   take that request back
//   publish   (power users) merge it into the kit and put it on the live site
//   stop      cancel the run working on it               delete   remove a build that isn't live
export async function POST(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  const id = typeof body?.id === 'string' ? body.id : '';
  const action = String(body?.action ?? '');
  const b = await prisma.gameBuild.findUnique({ where: { id }, select: { id: true, status: true, versions: true, run: true, log: true } }).catch(() => null);
  if (!b) return NextResponse.json({ error: 'No such build' }, { status: 404 });
  const no = (msg: string) => NextResponse.json({ error: msg }, { status: 409 });
  const set = (data: Record<string, unknown>, from: string[]) => prisma.gameBuild.updateMany({ where: { id, status: { in: from } }, data });

  if (action === 'push') {
    if (!BUILD_PUSHABLE.includes(b.status as never)) return no('It is already being worked on');
    const text = cleanText(body?.text, 4000);
    if (b.versions > 0 && !text) return no('Say what should change');
    await set({ status: 'queued', request: text, note: null, log: addLog(b.log, b.versions ? 'asked for changes' : 'pushed to Claude', text ?? undefined) }, BUILD_PUSHABLE);
    try {
      await dispatch('build', id);
    } catch (e) {
      await set({ status: b.status, note: `Could not start: ${(e as Error).message}` }, ['queued']);
      return NextResponse.json({ error: (e as Error).message }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }
  if (action === 'send') {
    const r = await set({ status: 'requested', log: addLog(b.log, 'sent to a power user', cleanText(body?.text, 1000) ?? undefined) }, ['review']);
    return r.count ? NextResponse.json({ ok: true }) : no('Only a build waiting for review can be sent');
  }
  if (action === 'unsend') {
    const r = await set({ status: 'review', log: addLog(b.log, 'request withdrawn') }, ['requested']);
    return r.count ? NextResponse.json({ ok: true }) : no('Nothing to withdraw');
  }
  if (action === 'publish') {
    if (!(await isPower())) return NextResponse.json({ error: 'Only a power user can publish' }, { status: 403 });
    const r = await set({ status: 'publishing', log: addLog(b.log, 'publishing to the live site') }, ['requested', 'review']);
    if (!r.count) return no('This build is not ready to publish');
    try {
      await dispatch('publish', id);
    } catch (e) {
      await set({ status: b.status }, ['publishing']);
      return NextResponse.json({ error: (e as Error).message }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }
  if (action === 'stop') {
    if (!BUILD_BUSY.includes(b.status as never)) return no('Nothing is running');
    if (b.run && /^\d+$/.test(b.run) && b.status !== 'queued') await cancelRun(b.run).catch(() => null);
    const back = b.status === 'publishing' ? 'requested' : b.versions ? 'review' : 'draft';
    await set({ status: back, note: 'Stopped', log: addLog(b.log, 'stopped') }, BUILD_BUSY);
    return NextResponse.json({ ok: true });
  }
  if (action === 'delete') {
    const r = await prisma.gameBuild.deleteMany({ where: { id, status: { notIn: [...BUILD_BUSY, 'live'] } } });
    return r.count ? NextResponse.json({ ok: true }) : no('It is running or live, so it stays');
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
