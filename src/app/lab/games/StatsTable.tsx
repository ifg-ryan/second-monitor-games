'use client';
// The per-game stats table on the lab's Games page. Click a column header to sort by it.
import { useState } from 'react';

export interface StatsRow {
  id: string;
  title: string;
  linked: boolean;
  version: string;
  /** Display text per column, and the raw number used for sorting (null = no data). */
  cells: { text: string; value: number | null }[];
}

export default function StatsTable({ columns, rows }: { columns: { label: string; tip?: string }[]; rows: StatsRow[] }) {
  const [sort, setSort] = useState<{ col: number; desc: boolean }>({ col: 0, desc: true });
  const sorted = [...rows].sort((a, b) => {
    if (sort.col < 0) return a.title.localeCompare(b.title) * (sort.desc ? -1 : 1);
    const x = a.cells[sort.col].value, y = b.cells[sort.col].value;
    if (x === y) return a.title.localeCompare(b.title);
    if (x === null) return 1;
    if (y === null) return -1;
    return sort.desc ? y - x : x - y;
  });
  const click = (col: number) => setSort((s) => ({ col, desc: s.col === col ? !s.desc : col >= 0 }));
  const arrow = (col: number) => (sort.col === col ? (sort.desc ? ' ↓' : ' ↑') : '');

  return (
    <div style={{ overflowX: 'auto', marginTop: '18px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: 'left' }} onClick={() => click(-1)}>Game{arrow(-1)}</th>
            {columns.map((c, i) => (
              <th key={c.label} title={c.tip} style={th} onClick={() => click(i)}>{c.label}{arrow(i)}</th>
            ))}
            <th style={{ ...th, cursor: 'default' }}>Live</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((g) => (
            <tr key={g.id} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ ...td, textAlign: 'left' }}>
                {g.linked ? <a href={`/lab/games?game=${g.id}`} style={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none' }}>{g.title}</a> : <span style={{ fontWeight: 600 }}>{g.title}</span>}
              </td>
              {g.cells.map((c, i) => <td key={i} style={{ ...td, color: c.value === null ? 'var(--text-muted)' : 'var(--text)' }}>{c.text}</td>)}
              <td style={{ ...td, color: 'var(--text-muted)' }}>{g.version}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: '8px 10px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer', textAlign: 'right', userSelect: 'none' } as const;
const td = { padding: '9px 10px', textAlign: 'right', whiteSpace: 'nowrap' } as const;
