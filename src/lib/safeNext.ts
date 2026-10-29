// Where to send a player after a sign-in step: only a path on this site, never another site.
// Rejects backslashes and control characters (browsers read "/\evil.com" as "//evil.com").
//
//   safeNext('/play/fiver')      // '/play/fiver'
//   safeNext('/\\evil.com')      // '/'
export function safeNext(raw: string | null | undefined, fallback = '/'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;
  try {
    const base = 'https://secondmonitorgames.com';
    const u = new URL(raw, base);
    if (u.origin !== base) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
