// Usernames and guest nicknames: the rules and the ban list.
//
//   checkUsername('Ryan_F')        // { ok: true, name: 'Ryan_F', key: 'ryan_f' }
//   checkUsername('admin')         // { ok: false, error: 'That name is reserved.' }
//   isBannedName('big d1ck')       // true
//
// The ban list (banlist.json) is generated from public profanity lists and the Kit's slur list
// (npm run banlist). Hand edits go in banlist-extra.ts.
//   inside: banned anywhere in the name, even with numbers or symbols in place of letters.
//   word:   banned as a whole word, or at the start or end of a run of letters (4+ letters),
//           unless the run is a real word in `safe` (peacock, cocktail, therapist).
import list from './banlist.json';
import { EXTRA_ALLOWED, EXTRA_ANYWHERE, EXTRA_WORDS, RESERVED_PREFIXES } from './banlist-extra';

export const USERNAME_RULE = /^[A-Za-z0-9_]{3,20}$/;

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', $: 's', '!': 'i', '+': 't', '|': 'l' };
/** Lowercase letters only, with look-alike numbers and symbols turned into letters. */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .split('')
    .map((c) => LEET[c] ?? c)
    .join('')
    .replace(/[^a-z]/g, '');
/** "fuuuck" -> "fuck": runs of a letter become one. */
const collapse = (s: string) => s.replace(/(.)\1+/g, '$1');

const allowed = new Set(EXTRA_ALLOWED);
const inside = [...list.inside, ...EXTRA_ANYWHERE].filter((w) => !allowed.has(w));
// Collapsed forms only where they stay 4+ letters (so "kkk" doesn't become "k").
const insideCollapsed = inside.map((w) => (collapse(w).length >= 4 ? collapse(w) : null));
const words = new Set([...list.word, ...EXTRA_WORDS].filter((w) => !allowed.has(w)));
const edgeWords = [...words].filter((w) => w.length >= 4);
const safe = new Set([...list.safe, ...EXTRA_ALLOWED]);
const reserved = new Set(list.reserved);

/** Runs of letters as typed: "BigDick_99" -> ["big", "dick"]. */
function runs(raw: string): string[] {
  return raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
}

function badRun(t: string): boolean {
  if (allowed.has(t) || safe.has(t)) return false;
  if (words.has(t)) return true;
  if (t.length < 5) return false;
  return edgeWords.some((w) => t !== w && (t.startsWith(w) || t.endsWith(w)));
}

/** True if the name contains a banned word. Works for usernames and nicknames (spaces allowed). */
export function isBannedName(raw: string): boolean {
  const n = normalize(raw);
  if (!n) return false;
  if (!allowed.has(n)) {
    const c = collapse(n);
    for (let i = 0; i < inside.length; i++) if (n.includes(inside[i]) || (insideCollapsed[i] && c.includes(insideCollapsed[i]!))) return true;
  }
  // Each part between spaces or underscores with look-alikes resolved ("b1gd1ck" -> "bigdick"),
  // and each run of letters as typed ("BigDick" -> "big", "dick").
  const parts = raw.split(/[\s_.-]+/).map(normalize).filter(Boolean);
  const candidates = new Set([...parts, ...runs(raw)]);
  for (const t of candidates) if (badRun(t)) return true;
  return false;
}

export function isReservedName(raw: string): boolean {
  const n = normalize(raw);
  return reserved.has(n) || reserved.has(raw.toLowerCase()) || RESERVED_PREFIXES.some((p) => n.startsWith(p));
}

export type UsernameCheck = { ok: true; name: string; key: string } | { ok: false; error: string };

export function checkUsername(raw: unknown): UsernameCheck {
  const name = typeof raw === 'string' ? raw.trim() : '';
  if (!USERNAME_RULE.test(name)) return { ok: false, error: '3 to 20 letters, numbers or underscores.' };
  if (isReservedName(name)) return { ok: false, error: 'That name is reserved.' };
  if (isBannedName(name)) return { ok: false, error: "That name isn't allowed." };
  return { ok: true, name, key: name.toLowerCase() };
}
