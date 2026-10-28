import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { kitGame } from '@/lib/kitGames';
import { AUDIO_TYPES, BUSY, MAX_AUDIO_BYTES, cleanContext, cleanText, isTester, labDenied } from '@/lib/lab';

// The tester feedback queue.
//   GET                                          the latest 300 notes, newest first (recordings via /api/lab/audio)
//   POST   { game, text?, audio?, audioType?, context? }   add a note: typed/uploaded text, a recording (base64), or both
//   PATCH  { id, text?, status? }                edit a note, or set it aside / back ("dismissed" | "new")
//   DELETE ?id=...                               remove a note
const unavailable = () => NextResponse.json({ error: 'The lab is unavailable right now' }, { status: 503 });
const EDITABLE = ['new', 'failed', 'dismissed', 'skipped', 'undone'];

export async function GET() {
  if (!(await isTester())) return labDenied();
  try {
    const rows = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: { id: true, game: true, text: true, audioType: true, transcript: true, heard: true, context: true, status: true, note: true, commit: true, run: true, createdAt: true, updatedAt: true },
    });
    const items = rows.map(({ audioType, ...r }: { audioType: string | null } & Record<string, unknown>) => ({ ...r, hasAudio: !!audioType }));
    return NextResponse.json({ items });
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  const game = kitGame(body?.game);
  if (!game) return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
  const text = cleanText(body?.text) ?? '';
  let audio: Buffer | null = null;
  let audioType: string | null = null;
  if (typeof body?.audio === 'string' && body.audio) {
    audioType = typeof body.audioType === 'string' && AUDIO_TYPES.test(body.audioType) ? body.audioType.split(';')[0] : null;
    audio = Buffer.from(body.audio, 'base64');
    if (!audioType || !audio.length) return NextResponse.json({ error: 'Unsupported recording' }, { status: 400 });
    if (audio.length > MAX_AUDIO_BYTES) return NextResponse.json({ error: 'Recording is too long' }, { status: 413 });
  }
  if (!text && !audio) return NextResponse.json({ error: 'Record or write something first' }, { status: 400 });
  try {
    const item = await prisma.feedback.create({
      data: { game: game.id, text, context: cleanContext(body?.context), ...(audio ? { audio: new Uint8Array(audio), audioType } : {}) },
      select: { id: true },
    });
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
  if (body.text !== undefined) data.text = cleanText(body.text) ?? '';
  if (body.status !== undefined) {
    if (body.status !== 'dismissed' && body.status !== 'new') return NextResponse.json({ error: 'Bad status' }, { status: 400 });
    data.status = body.status;
  }
  try {
    const r = await prisma.feedback.updateMany({ where: { id: body.id, status: { in: EDITABLE } }, data });
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
    await prisma.feedback.deleteMany({ where: { id, status: { notIn: [...BUSY, 'review', 'live'] } } });
    return NextResponse.json({ ok: true });
  } catch {
    return unavailable();
  }
}
