// Cloud save rules for /api/kit/save: what a write may contain, and applying it to the stored copy.
// The kit (claude-games kit/site/CloudSync.ts) does all the merging; the site only stores and
// refuses writes that started from an old revision.

export const MAX_BYTES = 256 * 1024;
export const MAX_KEYS = 500;
const KEY = /^[A-Za-z0-9_.:\-]{1,100}$/;

export interface SaveWrite {
  base: number;
  set: Record<string, unknown>;
  del: string[];
}

/** Check a write's shape. Returns an error message or the cleaned write. */
export function parseWrite(body: unknown): SaveWrite | string {
  if (!body || typeof body !== 'object') return 'Invalid request';
  const b = body as Record<string, unknown>;
  if (!Number.isInteger(b.base) || (b.base as number) < 0) return 'Invalid base';
  const set = b.set && typeof b.set === 'object' && !Array.isArray(b.set) ? (b.set as Record<string, unknown>) : {};
  const del = Array.isArray(b.del) ? b.del : [];
  for (const k of Object.keys(set)) if (!KEY.test(k) || k.startsWith('__') || k.startsWith('tuning:')) return `Invalid key ${k.slice(0, 40)}`;
  for (const k of del) if (typeof k !== 'string' || !KEY.test(k)) return 'Invalid key';
  return { base: b.base as number, set, del: del as string[] };
}

/** The stored keys after a write, or an error if it is too big. */
export function applyWrite(current: Record<string, unknown>, w: SaveWrite): Record<string, unknown> | string {
  const next = { ...current, ...w.set };
  for (const k of w.del) delete next[k];
  if (Object.keys(next).length > MAX_KEYS) return 'Too many saved keys';
  if (JSON.stringify(next).length > MAX_BYTES) return 'Save is too big';
  return next;
}

export function parseData(data: string | null | undefined): Record<string, unknown> {
  try {
    const v = JSON.parse(data ?? '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
