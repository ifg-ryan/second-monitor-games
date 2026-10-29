'use client';
// The game dropdown on the lab's Games page.
export default function GamePicker({ options, value }: { options: { id: string; title: string; versions: number }[]; value: string | null }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => location.assign(e.target.value ? `/lab/games?game=${e.target.value}` : '/lab/games')}
      style={{ width: '100%', maxWidth: '480px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', font: 'inherit', fontSize: '1rem' }}
    >
      <option value="">All games ({options.length})</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.title}{o.versions ? ` (v${o.versions})` : ''}
        </option>
      ))}
    </select>
  );
}
