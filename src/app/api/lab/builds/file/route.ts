import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRunner, isTester } from '@/lib/lab';

// GET /api/lab/builds/file?id=...   the uploaded GDD, for testers (download) and the runner (to build from).
export async function GET(request: Request) {
  if (!(await isRunner(request)) && !(await isTester())) return NextResponse.json({ error: 'Not a tester' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const row = await prisma.gameBuild.findUnique({ where: { id }, select: { file: true, fileType: true, fileName: true } }).catch(() => null);
  if (!row) return NextResponse.json({ error: 'No such build' }, { status: 404 });
  return new Response(Buffer.from(row.file), { headers: { 'Content-Type': row.fileType, 'Content-Disposition': `inline; filename="${row.fileName}"` } });
}
