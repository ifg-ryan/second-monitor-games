import { NextResponse } from 'next/server';
import { kitPlayer } from '@/lib/kitPlayer';

// GET /api/kit/me: is the player signed in, and under what name.
export async function GET() {
  const player = await kitPlayer();
  return NextResponse.json(player ? { signedIn: true, name: player.name } : { signedIn: false, name: null });
}
