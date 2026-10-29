'use client';
// Search and browse the kit: pieces by category, starter templates, modules and which games use what,
// and the Art section (looks and the art library, as pictures). ?tab=art opens on Art.
import { useMemo, useState } from 'react';
import LabNav from '@/components/lab/LabNav';
import ArtBrowser, { type ArtLibrary, type ArtLook } from './ArtBrowser';

interface Piece {
  id: string;
  name: string;
  category: string;
  module: string;
  status?: string;
  what: string;
  when?: string;
  goodFor: string[];
  example: string;
  usedBy: string[];
  path?: string;
}
export interface KitCatalog {
  generated: string;
  totals: { pieces: number; modules: number; tests: number };
  categories: { id: string; name: string; blurb: string }[];
  modules: { id: string; title: string; summary: string }[];
  pieces: Piece[];
  games: { id: string; name: string; uses: string[] }[];
  templates: { id: string; what: string }[];
  looks: ArtLook[];
  art: ArtLibrary;
}

const CANDIDATE = { id: 'candidate', name: 'In a game, could join the kit', blurb: 'Systems built inside one game that a second game could reuse.' };

type Tab = 'pieces' | 'art';

export default function KitBrowser({ catalog, initialQuery = '', initialTab = 'pieces', gameTitles }: { catalog: KitCatalog; initialQuery?: string; initialTab?: Tab; gameTitles: Record<string, string> }) {
  const [q, setQ] = useState(initialQuery);
  const [tab, setTabState] = useState<Tab>(initialTab);
  const setTab = (t: Tab) => {
    setTabState(t);
    const url = new URL(location.href);
    if (t === 'art') url.searchParams.set('tab', 'art');
    else url.searchParams.delete('tab');
    history.replaceState(null, '', url);
  };
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const cats = useMemo(() => [...catalog.categories, ...(catalog.categories.some((c) => c.id === CANDIDATE.id) ? [] : [CANDIDATE])].filter((c) => catalog.pieces.some((p) => p.category === c.id)), [catalog]);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = (p: Piece) => `${p.name} ${p.what} ${p.when ?? ''} ${p.goodFor.join(' ')} ${p.module} ${p.usedBy.join(' ')}`.toLowerCase();
  const shown = catalog.pieces.filter((p) => (!cat || p.category === cat) && words.every((w) => hay(p).includes(w)));
  const moduleTitle = (id: string) => catalog.modules.find((m) => m.id === id)?.title ?? id;

  return (
    <div>
      <LabNav />
      <p style={{ margin: '0 0 18px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        {catalog.totals.pieces} pieces in {catalog.totals.modules} modules, {catalog.templates.length} starter templates, {catalog.looks.length} art looks, {catalog.art.packs.length} art packs. Updated {catalog.generated}.
      </p>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {(['pieces', 'art'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{ border: `1px solid ${tab === t ? 'var(--accent)' : 'var(--border)'}`, background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? 'var(--bg)' : 'var(--text-dim)', borderRadius: '8px', padding: '7px 18px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
            {t === 'pieces' ? 'Pieces' : 'Art'}
          </button>
        ))}
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={tab === 'art' ? 'Search: pixel, cards, noir, Kenney, golf…' : 'Search: waves, deck, camera, tower defense, poker…'}
        autoFocus
        style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', font: 'inherit', fontSize: '1rem', marginBottom: '12px' }}
      />
      {tab === 'art' && <ArtBrowser looks={catalog.looks} art={catalog.art} query={q} gameTitles={gameTitles} />}
      {tab === 'pieces' && (<>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <Chip on={!cat} onClick={() => setCat(null)}>All</Chip>
        {cats.map((c) => (
          <Chip key={c.id} on={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)} title={c.blurb}>
            {c.name} <span style={{ opacity: 0.6 }}>{catalog.pieces.filter((p) => p.category === c.id).length}</span>
          </Chip>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {shown.map((p) => {
          const isOpen = open === p.id;
          return (
            <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <button type="button" onClick={() => setOpen(isOpen ? null : p.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                  <b style={{ color: 'var(--text)' }}>{p.name}</b>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{moduleTitle(p.module)}</span>
                  {p.category === 'candidate' && <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>in a game</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.usedBy.length ? `used by ${p.usedBy.length}` : ''} {isOpen ? '▴' : '▾'}</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.45, ...(isOpen ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }) }}>{p.what}</div>
              </button>
              {isOpen && (
                <div style={{ padding: '0 16px 14px', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text)' }}>
                  {p.when && <p style={{ margin: '0 0 8px' }}><b>When to use:</b> {p.when}</p>}
                  {p.goodFor.length > 0 && <p style={{ margin: '0 0 8px' }}><b>Good for:</b> {p.goodFor.join(', ')}</p>}
                  {p.usedBy.length > 0 && <p style={{ margin: '0 0 8px' }}><b>Used by:</b> {p.usedBy.join(', ')}</p>}
                  {p.example && (
                    <pre style={{ margin: '8px 0 0', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.45 }}>{p.example}</pre>
                  )}
                  {p.path && <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.path}</p>}
                </div>
              )}
            </div>
          );
        })}
        {!shown.length && <p style={{ color: 'var(--text-muted)' }}>Nothing matches. Try a broader word.</p>}
      </div>

      <h2 style={h2}>Starter templates</h2>
      <div style={grid}>
        {catalog.templates.map((t) => (
          <div key={t.id} style={card}><b>{t.id}</b><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>{t.what}</div></div>
        ))}
      </div>

      <h2 style={h2}>Modules</h2>
      <div style={grid}>
        {catalog.modules.map((m) => (
          <div key={m.id} style={card}><b>{m.title}</b><div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>{m.summary}</div></div>
        ))}
      </div>

      <h2 style={h2}>Games and what they use</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {catalog.games.map((g) => (
          <div key={g.id} style={{ fontSize: '0.85rem' }}><b>{gameTitles[g.id] ?? g.name}</b> <span style={{ color: 'var(--text-muted)' }}>{g.uses.join(' · ')}</span></div>
        ))}
      </div>
      </>)}
    </div>
  );
}

function Chip({ on, onClick, title, children }: { on: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title} style={{ border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`, background: on ? 'var(--accent-dim)' : 'transparent', color: on ? 'var(--accent)' : 'var(--text-dim)', borderRadius: '999px', padding: '5px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
      {children}
    </button>
  );
}

const h2 = { fontSize: '1.15rem', fontWeight: 700, margin: '40px 0 12px' } as const;
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' } as const;
const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' } as const;
