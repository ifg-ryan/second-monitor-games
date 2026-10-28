import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { kitGame } from '@/lib/kitGames';
import { cleanContext, cleanText, isTester, labDenied } from '@/lib/lab';

// The tester feedback queue.
//   GET                          the latest 300 notes, newest first
//   POST   { game, text, context? }   add a note
//   PATCH  { id, text?, status? }     edit a note, or dismiss / restore it ("dismissed" | "new")
//   DELETE ?id=...                    remove a note
const unavailable = () => NextResponse.json({ error: 'The lab is unavailable right now' }, { status: 503 });

export async function GET() {
  if (!(await isTester())) return labDenied();
  try {
    const items = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });
    return NextResponse.json({ items });
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  const game = kitGame(body?.game);
  const text = cleanText(body?.text);
  if (!game) return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
  if (!text) return NextResponse.json({ error: 'Say or type something first' }, { status: 400 });
  try {
    const item = await prisma.feedback.create({ data: { game: game.id, text, context: cleanContext(body?.context) } });
    return NextResponse.json({ item });
  } catch {
    return unavailable();
  }
}

export async function PATCH(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  if (typeof body?.id !== 'string') return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const data: { text?: string; status?: string } = {};
  if (body.text !== undefined) {
    const text = cleanText(body.text);
    if (!text) return NextResponse.json({ error: 'Empty note' }, { status: 400 });
    data.text = text;
  }
  if (body.status !== undefined) {
    if (body.status !== 'dismissed' && body.status !== 'new') return NextResponse.json({ error: 'Bad status' }, { status: 400 });
    data.status = body.status;
  }
  try {
    // Only notes nobody is working on can change.
    const r = await prisma.feedback.updateMany({ where: { id: body.id, status: { in: ['new', 'failed', 'dismissed', 'skipped', 'undone'] } }, data });
    if (!r.count) return NextResponse.json({ error: 'That note is being worked on' }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    return unavailable();
  }
}

export async function DELETE(request: Request) {
  if (!(await isTester())) return labDenied();
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    await prisma.feedback.deleteMany({ where: { id, status: { notIn: ['queued', 'working', 'undoing'] } } });
    return NextResponse.json({ ok: true });
  } catch {
    return unavailable();
  }
}
