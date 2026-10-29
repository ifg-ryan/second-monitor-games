// First sign-in: pick a username. Signed-in players without one are sent here from every page.
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import type { Metadata } from 'next';
import { ensureUser } from '@/lib/accounts';
import { safeNext as safePath } from '@/lib/safeNext';
import WelcomeForm from './WelcomeForm';

export const metadata: Metadata = { title: 'Pick a username', robots: { index: false } };

const safeNext = (raw: string | undefined) => {
  const p = safePath(raw);
  return p.startsWith('/welcome') ? '/' : p;
};

export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { userId } = await auth();
  const next = safeNext((await searchParams).next);
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/welcome?next=${encodeURIComponent(next)}`)}`);
  let suggestion = '';
  try {
    const user = await ensureUser(userId);
    if (user.username) redirect(`/api/user/named?next=${encodeURIComponent(next)}`);
    const cu = await currentUser();
    suggestion = (cu?.firstName ?? '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 20);
  } catch (e) {
    // redirect() works by throwing; let it through. Anything else: show the form without a suggestion.
    if (isRedirectError(e)) throw e;
  }
  return <WelcomeForm next={next} suggestion={suggestion} />;
}
