// New games built from a GDD in the lab (/lab/builds). The life of one build:
//
//   draft -> queued -> working -> review -> (ask for changes: queued again, a new version)
//                                       \-> requested (sent to a power user) -> publishing -> live
//
// Anyone with the lab passcode can upload, push to Claude, ask for changes and send to a power user.
// Only power users (LAB_POWER_PASSCODE) can publish to the live site. Each push starts the
// claude-games feedback workflow in "build" mode; publishing starts it in "publish" mode.
export const BUILD_STATUSES = ['draft', 'queued', 'working', 'review', 'requested', 'publishing', 'live', 'failed'] as const;
export type BuildStatus = (typeof BUILD_STATUSES)[number];

/** A run is busy with the build. */
export const BUILD_BUSY: BuildStatus[] = ['queued', 'working', 'publishing'];
/** States a tester can push (a first build, or a new version). */
export const BUILD_PUSHABLE: BuildStatus[] = ['draft', 'review', 'failed', 'requested'];
/** What the runner may write back. */
export const BUILD_RESULTS: BuildStatus[] = ['working', 'review', 'failed', 'live', 'requested', 'draft'];

export const MAX_GDD_BYTES = 3_000_000;
export const GDD_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  md: 'text/markdown',
  markdown: 'text/markdown',
  txt: 'text/plain',
};

/** A game id from a title: lowercase words joined by dashes, at most 40 characters. */
export function slugify(title: string): string {
  const s = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return s || 'new-game';
}

/** The first of slug, slug-2, slug-3… that is not taken. */
export function freeSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

export type LogEntry = { at: string; event: string; text?: string };

export function addLog(log: string, event: string, text?: string): string {
  let list: LogEntry[] = [];
  try {
    list = JSON.parse(log);
  } catch {}
  list.push({ at: new Date().toISOString(), event, ...(text ? { text: text.slice(0, 2000) } : {}) });
  return JSON.stringify(list.slice(-100));
}

export const previewBatch = (id: string) => `build-${id}`;

/** Everything about a build except the file bytes. */
export const BUILD_FIELDS = { id: true, title: true, slug: true, fileName: true, notes: true, request: true, status: true, note: true, preview: true, reuse: true, versions: true, log: true, createdAt: true, updatedAt: true } as const;
