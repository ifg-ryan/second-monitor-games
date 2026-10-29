'use client';
// The Kit browser's Art section: every art look (drawn in code) and every pack in the art library,
// as a picture grid. Click a card for the large view; arrow keys step through, Esc closes.
// Data and images: lab-data/kit-catalog.json and public/images/art/, written by claude-games scripts/lab-catalog.mjs.
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ArtLook {
  id: string;
  name: string;
  description: string;
  games: string[];
  render: string;
  paper: string;
  inks: string[];
  fonts: string[];
  surface: string[];
  image: string;
  ui: string;
}
export interface ArtPack {
  id: string;
  style: string;
  title: string;
  author: string;
  license: string;
  kind: string;
  goodFor: string[];
  notes: string;
  homepage: string;
  local: boolean;
  image: string;
}
export interface ArtLibrary {
  styles: { id: string; name: string; look: string; bestFor: string[] }[];
  packs: ArtPack[];
}

type Item = { kind: 'look'; look: ArtLook } | { kind: 'pack'; pack: ArtPack };

export default function ArtBrowser({ looks, art, query, gameTitles }: { looks: ArtLook[]; art: ArtLibrary; query: string; gameTitles: Record<string, string> }) {
  const [style, setStyle] = useState('looks');
  const [open, setOpen] = useState<number | null>(null);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const match = (text: string) => words.every((w) => text.toLowerCase().includes(w));
  const title = useCallback((id: string) => gameTitles[id] ?? id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), [gameTitles]);

  const styles = useMemo(
    () => [
      { id: 'looks', name: 'Looks', count: looks.length },
      ...art.styles.filter((s) => s.id !== 'looks').map((s) => ({ id: s.id, name: s.name.replace(/ \(.*\)$/, ''), count: art.packs.filter((p) => p.style === s.id).length })),
    ],
    [looks, art],
  );
  const styleInfo = art.styles.find((s) => s.id === style);

  const items: Item[] = useMemo(() => {
    if (style === 'looks') return looks.filter((l) => match(`${l.name} ${l.description} ${l.fonts.join(' ')} ${l.surface.join(' ')} ${l.games.map(title).join(' ')}`)).map((look) => ({ kind: 'look', look }));
    return art.packs
      .filter((p) => p.style === style && match(`${p.title} ${p.author} ${p.kind} ${p.notes} ${p.goodFor.join(' ')}`))
      .sort((a, b) => Number(!!b.image) - Number(!!a.image))
      .map((pack) => ({ kind: 'pack', pack }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, looks, art, query, title]);

  useEffect(() => setOpen(null), [style, query]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, items.length]);

  const current = open === null ? null : items[open];

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {styles.map((s) => (
          <button key={s.id} type="button" onClick={() => setStyle(s.id)} className={style === s.id ? 'art-chip on' : 'art-chip'}>
            {s.name} <span style={{ opacity: 0.6 }}>{s.count}</span>
          </button>
        ))}
      </div>
      {style !== 'looks' && styleInfo && <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: '80ch' }}>{styleInfo.look}</p>}

      <div className="art-grid">
        {items.map((it, i) =>
          it.kind === 'look' ? (
            <button key={it.look.id} type="button" className="art-card" onClick={() => setOpen(i)}>
              <Thumb src={it.look.image} alt={it.look.name} />
              <div className="art-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <b>{it.look.name}</b>
                  <Swatches inks={it.look.inks} size={12} />
                </div>
                <div className="art-sub">{it.look.games.map(title).join(', ') || 'Unused'}</div>
              </div>
            </button>
          ) : (
            <button key={it.pack.id} type="button" className="art-card" onClick={() => setOpen(i)}>
              <Thumb src={it.pack.image} alt={it.pack.title} label={it.pack.local ? 'No preview' : 'Online only'} crisp={CRISP.has(it.pack.style)} />
              <div className="art-meta">
                <b>{it.pack.title}</b>
                <div className="art-sub">{[it.pack.kind, it.pack.author].filter(Boolean).join(' · ')}</div>
              </div>
            </button>
          ),
        )}
      </div>
      {!items.length && <p style={{ color: 'var(--text-muted)' }}>Nothing matches. Try a broader word.</p>}

      {current && (
        <div className="art-overlay" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <div className="art-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <b style={{ fontSize: '1.3rem' }}>{current.kind === 'look' ? current.look.name : current.pack.title}</b>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(open ?? 0) + 1} / {items.length}</span>
              <button type="button" className="art-nav" onClick={() => setOpen(((open ?? 0) - 1 + items.length) % items.length)} aria-label="Previous">‹</button>
              <button type="button" className="art-nav" onClick={() => setOpen(((open ?? 0) + 1) % items.length)} aria-label="Next">›</button>
              <button type="button" className="art-nav" onClick={() => setOpen(null)} aria-label="Close">×</button>
            </div>
            {current.kind === 'look' ? <LookDetail look={current.look} title={title} gameTitles={gameTitles} /> : <PackDetail pack={current.pack} />}
          </div>
        </div>
      )}

      <style>{`
        .art-chip{border:1px solid var(--border);background:transparent;color:var(--text-dim);border-radius:999px;padding:5px 12px;font-size:.8rem;font-weight:600;cursor:pointer}
        .art-chip.on{border-color:var(--accent);background:var(--accent-dim);color:var(--accent)}
        .art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
        .art-card{all:unset;cursor:pointer;display:block;background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:transform .12s,border-color .12s}
        .art-card:hover,.art-card:focus-visible{transform:translateY(-2px);border-color:var(--accent)}
        .art-thumb{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;background:var(--bg)}
        .art-meta{padding:10px 12px 12px;font-size:.9rem;color:var(--text)}
        .art-sub{font-size:.78rem;color:var(--text-muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .art-overlay{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.72);display:flex;align-items:flex-start;justify-content:center;padding:4vh 16px;overflow-y:auto}
        .art-sheet{width:min(1100px,100%);background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 20px 22px;color:var(--text)}
        .art-nav{border:1px solid var(--border);background:var(--bg);color:var(--text);width:34px;height:34px;border-radius:8px;font-size:1.2rem;line-height:1;cursor:pointer}
        .art-nav:hover{border-color:var(--accent)}
        .art-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .art-pair img,.art-big{display:block;width:100%;border-radius:8px;border:1px solid var(--border)}
        .art-facts{display:grid;grid-template-columns:110px 1fr;gap:6px 14px;margin:16px 0 0;font-size:.88rem;line-height:1.5}
        .art-facts dt{color:var(--text-muted)}
        .art-facts dd{margin:0}
        @media (max-width:720px){.art-pair{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}

/** Pixel art scales up with hard edges. */
const CRISP = new Set(['pixel', 'retro']);

function Thumb({ src, alt, label = 'No preview', crisp = false }: { src: string; alt: string; label?: string; crisp?: boolean }) {
  if (!src) return <div className="art-thumb" style={{ display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{label}</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="art-thumb" src={src} alt={alt} loading="lazy" style={crisp ? { imageRendering: 'pixelated' } : undefined} />;
}

function Swatches({ inks, size }: { inks: string[]; size: number }) {
  return (
    <span style={{ display: 'inline-flex', marginLeft: 'auto' }}>
      {inks.map((c, i) => (
        <span key={i} title={c} style={{ width: size, height: size, borderRadius: '50%', background: c, border: '1px solid rgba(127,127,127,.45)', marginLeft: i ? -size / 4 : 0 }} />
      ))}
    </span>
  );
}

function LookDetail({ look, title, gameTitles }: { look: ArtLook; title: (id: string) => string; gameTitles: Record<string, string> }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div className="art-pair">{[look.image, look.ui].filter(Boolean).map((src) => <img key={src} src={src} alt={look.name} />)}</div>
      {look.description && <p style={{ margin: '16px 0 0', lineHeight: 1.55 }}>{look.description}</p>}
      <dl className="art-facts">
        <dt>Used by</dt>
        <dd>
          {look.games.length
            ? look.games.map((g, i) => (
                <span key={g}>
                  {i > 0 && ', '}
                  {gameTitles[g] ? <a href={`/play/${g}`} style={{ color: 'var(--accent)' }}>{title(g)}</a> : title(g)}
                </span>
              ))
            : 'No game yet'}
        </dd>
        <dt>Inks</dt>
        <dd style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {look.inks.map((c) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: c, border: '1px solid rgba(127,127,127,.45)' }} />
              {c}
            </span>
          ))}
        </dd>
        <dt>Type</dt>
        <dd>{look.fonts.join(' / ')}</dd>
        <dt>Drawing</dt>
        <dd>{[look.render, ...look.surface].join(' · ')}</dd>
        <dt>In a GDD</dt>
        <dd><code>Look: {look.name}</code></dd>
      </dl>
    </>
  );
}

function PackDetail({ pack }: { pack: ArtPack }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {pack.image ? <img className="art-big" src={pack.image} alt={pack.title} style={CRISP.has(pack.style) ? { imageRendering: 'pixelated' } : undefined} /> : null}
      {pack.notes && <p style={{ margin: '16px 0 0', lineHeight: 1.55 }}>{pack.notes}</p>}
      <dl className="art-facts">
        {pack.kind && (<><dt>Kind</dt><dd>{pack.kind}</dd></>)}
        {pack.author && (<><dt>By</dt><dd>{pack.author}</dd></>)}
        {pack.license && (<><dt>License</dt><dd>{pack.license}</dd></>)}
        {pack.goodFor.length > 0 && (<><dt>Good for</dt><dd>{pack.goodFor.join(', ')}</dd></>)}
        <dt>In the kit</dt>
        <dd>{pack.local ? <code>{pack.id}</code> : 'Not downloaded; link only'}</dd>
        {pack.homepage && (<><dt>Source</dt><dd><a href={pack.homepage} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{pack.homepage.replace(/^https?:\/\//, '')}</a></dd></>)}
      </dl>
    </>
  );
}
