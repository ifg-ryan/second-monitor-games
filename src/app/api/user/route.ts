import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { deleteAccountData, NAMED_COOKIE } from '@/lib/accounts';

// DELETE /api/user  { confirm: true }
// Deletes the signed-in player's account: scores, achievements, play stats, username, and the Clerk login.
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body.confirm !== true) return NextResponse.json({ error: 'Confirm first' }, { status: 400 });
  try {
    await deleteAccountData(userId);
    await (await clerkClient()).users.deleteUser(userId);
  } catch {
    return NextResponse.json({ error: "Couldn't delete the account. Try again." }, { status: 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(NAMED_COOKIE);
  return res;
}
