import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRunner, isTester } from '@/lib/lab';

// GET /api/lab/audio?id=...   a note's recording, for testers (playback in /lab) and the runner (transcription).
export async function GET(request: Request) {
  if (!(await isRunner(request)) && !(await isTester())) return NextResponse.json({ error: 'Not a tester' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const row = await prisma.feedback.findUnique({ where: { id }, select: { audio: true, audioType: true } }).catch(() => null);
  if (!row?.audio || !row.audioType) return NextResponse.json({ error: 'No recording' }, { status: 404 });
  return new Response(Buffer.from(row.audio), { headers: { 'Content-Type': row.audioType, 'Cache-Control': 'private, max-age=86400' } });
}
