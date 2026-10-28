import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanText, dispatch, isTester, labDenied } from '@/lib/lab';

// POST /api/lab/review { batch, action: "approve" | "reject", comment? }
// Approve: the batch's changes go live (merged into the kit, games re-shipped).
// Reject (Send back): the preview is thrown away and the notes return to the inbox with the comment
// added, so the next Push tells Claude what was wrong with the first try.
export async function POST(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  const batch = typeof body?.batch === 'string' && /^[\w-]{1,40}$/.test(body.batch) ? body.batch : null;
  const action = body?.action === 'approve' || body?.action === 'reject' ? body.action : null;
  if (!batch || !action) return NextResponse.json({ error: 'Missing batch or action' }, { status: 400 });
  const items = await prisma.feedback.findMany({ where: { run: batch, status: 'review' }, select: { id: true, text: true, note: true } });
  if (!items.length) return NextResponse.json({ error: 'Nothing waiting for review in that batch' }, { status: 409 });

  const ids = items.map((i: { id: string }) => i.id);
  const next = action === 'approve' ? 'approving' : 'rejecting';
  if (action === 'reject') {
    const comment = cleanText(body?.comment, 2000);
    for (const i of items) {
      const tried = i.note ? `\n\nFirst try: ${i.note}` : '';
      await prisma.feedback.update({ where: { id: i.id }, data: { status: next, text: comment ? `${i.text}${tried}\nSent back: ${comment}` : i.text, note: comment ? `Sent back: ${comment}` : 'Sent back' } });
    }
  } else {
    await prisma.feedback.updateMany({ where: { id: { in: ids } }, data: { status: next } });
  }
  try {
    await dispatch(action, batch);
  } catch (e) {
    await prisma.feedback.updateMany({ where: { id: { in: ids }, status: next }, data: { status: 'review' } });
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
