import { NextResponse } from 'next/server';
import { kitPlayer } from '@/lib/kitPlayer';
import { accountLevel } from '@/lib/xp';

// GET /api/kit/me: is the player signed in, under what name, and their account XP and level.
export async function GET() {
  const player = await kitPlayer();
  if (!player) return NextResponse.json({ signedIn: false, name: null });
  const lv = await accountLevel(player.userId).catch(() => null);
  return NextResponse.json({ signedIn: true, name: player.name, ...(lv ? { xp: lv.xp, level: lv.level, levelFloor: lv.floor, levelNext: lv.next } : {}) });
}
