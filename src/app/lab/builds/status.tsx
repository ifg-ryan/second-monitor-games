// How each build status reads in the lab.
export const STATUS_LABEL: Record<string, { text: string; tone: 'quiet' | 'busy' | 'good' | 'bad' | 'ask' }> = {
  draft: { text: 'Not built yet', tone: 'quiet' },
  queued: { text: 'Waiting for Claude', tone: 'busy' },
  working: { text: 'Claude is building', tone: 'busy' },
  review: { text: 'Ready to test', tone: 'ask' },
  requested: { text: 'Waiting for a power user', tone: 'ask' },
  publishing: { text: 'Going live', tone: 'busy' },
  live: { text: 'Live', tone: 'good' },
  failed: { text: 'Build failed', tone: 'bad' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { text: status, tone: 'quiet' as const };
  const color = { quiet: 'var(--text-muted)', busy: 'var(--accent)', good: 'var(--accent-blue)', bad: 'var(--accent-red)', ask: 'var(--accent)' }[s.tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color, border: `1px solid ${color}`, borderRadius: '999px', padding: '2px 10px', whiteSpace: 'nowrap' }}>
      {s.tone === 'busy' && <span className="lab-pulse">●</span>}
      {s.text}
    </span>
  );
}

export interface Build {
  id: string;
  title: string;
  slug: string;
  fileName: string;
  notes: string;
  request: string | null;
  status: string;
  note: string | null;
  preview: string | null;
  reuse: string | null;
  versions: number;
  log: string;
  createdAt: string;
  updatedAt: string;
}
