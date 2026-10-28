// The tester lab: a hidden queue at /lab where testers' recorded, typed or uploaded notes wait
// until someone presses Push. Push starts the "feedback" workflow in the claude-games repo on
// GitHub: recordings are transcribed, Claude applies the notes on a branch and ships preview
// builds. The batch then waits in Review until someone presses Approve (goes live) or Send back.
//
//   new -> queued -> working -> review -> approving -> live -> undoing -> undone
//                                     \-> rejecting -> new (with the reviewer's comment)
//
// Env (Vercel):
//   LAB_PASSCODE           what testers type at /lab to get in (also unlocks the Feedback button)
//   LAB_RUNNER_KEY         shared secret the GitHub workflow sends to read and update the queue
//   GITHUB_DISPATCH_TOKEN  fine-grained GitHub token with Actions: write on ifg-ryan/claude-games
//   LAB_REPO               optional, defaults to ifg-ryan/claude-games
//
//   if (!(await isTester())) return labDenied();
//   await dispatch('apply');
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const LAB_COOKIE = 'smg_lab';
/** Readable by the page so the Feedback button knows to show. Grants nothing by itself. */
export const TESTER_COOKIE = 'smg_tester';

export const STATUSES = ['new', 'queued', 'working', 'review', 'approving', 'rejecting', 'live', 'skipped', 'failed', 'dismissed', 'undoing', 'undone'] as const;
export type FeedbackStatus = (typeof STATUSES)[number];

/** Statuses a tester can push. */
export const PUSHABLE: FeedbackStatus[] = ['new', 'failed'];
/** Statuses the runner may write back. */
export const RUNNER_RESULTS: FeedbackStatus[] = ['working', 'review', 'live', 'skipped', 'failed', 'new', 'undone'];
/** Statuses where a run is busy with the note, so testers can't edit or delete it. */
export const BUSY: FeedbackStatus[] = ['queued', 'working', 'approving', 'rejecting', 'undoing'];

/** Recordings: up to about 10 minutes at the bitrate the composer asks for. */
export const MAX_AUDIO_BYTES = 3_000_000;
export const AUDIO_TYPES = /^audio\/(webm|ogg|mp4|mpeg|wav|x-m4a|aac)(;.*)?$/;

function sign(passcode: string): string {
  return createHmac('sha256', passcode).update('smg-lab-v1').digest('hex');
}

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The cookie value for a correct passcode, or null. */
export function labToken(passcode: string | undefined | null): string | null {
  const real = process.env.LAB_PASSCODE;
  if (!real || !passcode || !same(passcode.trim(), real)) return null;
  return sign(real);
}

export async function isTester(): Promise<boolean> {
  const real = process.env.LAB_PASSCODE;
  const got = (await cookies()).get(LAB_COOKIE)?.value;
  return !!real && !!got && same(got, sign(real));
}

export function isRunner(request: Request): boolean {
  const key = process.env.LAB_RUNNER_KEY;
  const got = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  return !!key && !!got && same(got, key);
}

export const labDenied = () => NextResponse.json({ error: 'Not a tester' }, { status: 401 });

/** Keep only the small, known context fields a tester's browser sends. */
export function cleanContext(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const out: Record<string, string | number> = {};
  for (const k of ['build', 'seconds', 'screen', 'browser']) {
    const v = r[k];
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.round(v);
    else if (typeof v === 'string' && v) out[k] = v.slice(0, 120);
  }
  return Object.keys(out).length ? JSON.stringify(out) : null;
}

export function cleanText(raw: unknown, max = 20000): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.replace(/\r/g, '').trim().slice(0, max);
  return t || null;
}

/** Start the claude-games feedback workflow. Throws with a readable message when it can't. */
export async function dispatch(mode: 'apply' | 'approve' | 'reject' | 'undo', ref = ''): Promise<void> {
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) throw new Error('GITHUB_DISPATCH_TOKEN is not set on the site');
  const repo = process.env.LAB_REPO ?? 'ifg-ryan/claude-games';
  const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/feedback.yml/dispatches`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: JSON.stringify({ ref: 'main', inputs: { mode, ref } }),
  });
  if (!res.ok) throw new Error(`GitHub said ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
