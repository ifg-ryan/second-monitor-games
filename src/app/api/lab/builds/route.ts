import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { KIT_GAMES } from '@/lib/kitGames';
import { cleanText, isTester, labDenied } from '@/lib/lab';
import { BUILD_FIELDS, GDD_TYPES, MAX_GDD_BYTES, addLog, freeSlug, slugify } from '@/lib/builds';

// New games from a GDD.
//   GET                                                    every build, newest first (no file bytes)
//   POST { title, notes?, fileName, data (base64) }        upload a GDD as a new draft build
const unavailable = () => NextResponse.json({ error: 'The lab is unavailable right now' }, { status: 503 });

export async function GET() {
  if (!(await isTester())) return labDenied();
  try {
    const builds = await prisma.gameBuild.findMany({ orderBy: { createdAt: 'desc' }, take: 100, select: BUILD_FIELDS });
    return NextResponse.json({ builds });
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request) {
  if (!(await isTester())) return labDenied();
  const body = await request.json().catch(() => ({}));
  const title = cleanText(body?.title, 80);
  const fileName = typeof body?.fileName === 'string' ? body.fileName.replace(/[^\w .()-]/g, '').slice(0, 120) : '';
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (!title) return NextResponse.json({ error: 'Give the game a title' }, { status: 400 });
  if (!GDD_TYPES[ext]) return NextResponse.json({ error: 'Upload a PDF, Word (.docx), Markdown or text file' }, { status: 400 });
  const file = typeof body?.data === 'string' ? Buffer.from(body.data, 'base64') : null;
  if (!file?.length) return NextResponse.json({ error: 'The file is empty' }, { status: 400 });
  if (file.length > MAX_GDD_BYTES) return NextResponse.json({ error: 'The file is over 3 MB. Save it without images, or as a PDF.' }, { status: 413 });
  try {
    const taken = new Set<string>([...KIT_GAMES.map((g) => g.id), ...(await prisma.gameBuild.findMany({ select: { slug: true } })).map((b: { slug: string }) => b.slug)]);
    const build = await prisma.gameBuild.create({
      data: { title, slug: freeSlug(slugify(title), taken), fileName, fileType: GDD_TYPES[ext], file: new Uint8Array(file), notes: cleanText(body?.notes, 4000) ?? '', log: addLog('[]', 'uploaded', fileName) },
      select: { id: true },
    });
    return NextResponse.json({ build });
  } catch {
    return unavailable();
  }
}
