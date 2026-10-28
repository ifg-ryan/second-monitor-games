'use client';
// The queue itself: Inbox (pick and Push), In progress, Review (try the preview, then Approve or Send back),
// Live (with Undo per push), and Set aside.
import { useCallback, useEffect, useMemo, useState } from 'react';
import FeedbackComposer, { btn } from '@/components/lab/FeedbackComposer';

interface Item {
  id: string;
  game: string;
  text: string;
  hasAudio: boolean;
  transcript: string | null;
  heard: string | null;
  link: string | null;
  run: string | null;
  context: string | null;
  status: string;
  note: string | null;
  commit: string | null;
  createdAt: string;
  updatedAt: string;
}
interface Game {
  id: string;
  title: string;
  icon: string;
  build?: string;
}

const BUSY = ['queued', 'working', 'approving', 'rejecting', 'undoing'];
const LABEL: Record<string, string> = { queued: 'Waiting for Claude', working: 'Claude is on it', approving: 'Going live', rejecting: 'Sending back', undoing: 'Undoing' };

function ago(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function moment(ctx: string | null): string {
  try {
    const c = JSON.parse(ctx ?? '');
    if (typeof c.seconds !== 'number') return '';
    const m = Math.floor(c.seconds / 60);
    return `${m}:${String(c.seconds % 60).padStart(2, '0')} in`;
  } catch {
    return '';
  }
}

export default function LabQueue({ games }: { games: Game[] }) {
  const [items, setItems] = useState<Item[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [, setSeen] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [addGame, setAddGame] = useState(games[0]?.id ?? '');
  const [banner, setBanner] = useState('');
  const [loaded, setLoaded] = useState(false);
  const title = useMemo(() => Object.fromEntries(games.map((g) => [g.id, `${g.icon} ${g.title}`])), [games]);

  const load = useCallback(async () => {
    const res = await fetch('/api/lab/feedback', { cache: 'no-store' }).catch(() => null);
    if (!res?.ok) {
      setBanner(res?.status === 401 ? 'Signed out' : 'The lab is unavailable right now');
      return;
    }
    const list: Item[] = (await res.json()).items;
    setItems(list);
    setLoaded(true);
    // New inbox notes start ticked, so Push sends everything unless you untick it.
    setSeen((old) => {
      const fresh = list.filter((i) => (i.status === 'new' || i.status === 'failed') && !old.has(i.id));
      if (fresh.length) setPicked((p) => new Set([...p, ...fresh.map((i) => i.id)]));
      return new Set([...old, ...list.map((i) => i.id)]);
    });
  }, []);

  const busy = items.some((i) => BUSY.includes(i.status));
  useEffect(() => {
    load();
    const t = setInterval(load, busy ? 5000 : 30000);
    return () => clearInterval(t);
  }, [load, busy]);

  const inbox = items.filter((i) => i.status === 'new' || i.status === 'failed');
  const working = items.filter((i) => BUSY.includes(i.status));
  const review = items.filter((i) => i.status === 'review');
  const live = items.filter((i) => i.status === 'live');
  const aside = items.filter((i) => ['skipped', 'dismissed', 'undone'].includes(i.status));
  const chosen = inbox.filter((i) => picked.has(i.id));

  async function call(url: string, method: string, body?: unknown) {
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
    if (!res?.ok) setBanner((await res?.json().catch(() => null))?.error ?? 'Something went wrong');
    else setBanner('');
    await load();
    return !!res?.ok;
  }

  const push = () => call('/api/lab/push', 'POST', { ids: chosen.map((i) => i.id) });
  const stop = (ids: string[]) => call('/api/lab/stop', 'POST', { ids });
  const approve = (batch: string) => call('/api/lab/review', 'POST', { batch, action: 'approve' });
  function sendBack(batch: string) {
    const comment = prompt('What should change? (goes back to the inbox with the notes)');
    if (comment !== null) call('/api/lab/review', 'POST', { batch, action: 'reject', comment });
  }
  const undo = (commit: string) => confirm('Undo this push and re-ship those games?') && call('/api/lab/undo', 'POST', { commit });
  const setStatus = (id: string, status: 'new' | 'dismissed') => call('/api/lab/feedback', 'PATCH', { id, status });
  const remove = (id: string) => call(`/api/lab/feedback?id=${id}`, 'DELETE');
  async function save(id: string) {
    if (await call('/api/lab/feedback', 'PATCH', { id, text: draft })) setEditing(null);
  }
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const group = (list: Item[], key: (i: Item) => string) => list.reduce<Record<string, Item[]>>((acc, i) => ((acc[key(i)] ??= []).push(i), acc), {});
  const byCommit = group(live, (i) => i.commit ?? '?');
  const byBatch = group(review, (i) => i.run ?? '?');
  const gamesIn = (list: Item[]) => [...new Set(list.map((g) => g.game))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2rem', margin: 0 }}>Lab</h1>
        <button type="button" onClick={() => fetch('/api/lab/login', { method: 'DELETE' }).then(() => location.reload())} className="nav-link-muted" style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: '0.8rem' }}>Sign out</button>
      </header>
      {banner && <div style={{ ...card, borderColor: 'var(--accent-red)', color: 'var(--accent-red)', fontSize: '0.85rem' }}>{banner}</div>}

      <section style={card}>
        <select value={addGame} onChange={(e) => setAddGame(e.target.value)} style={{ ...field, marginBottom: '10px' }}>
          {games.map((g) => <option key={g.id} value={g.id}>{g.icon} {g.title}</option>)}
        </select>
        <FeedbackComposer game={addGame} context={() => ({ build: games.find((g) => g.id === addGame)?.build ?? 'unknown' })} onSent={load} />
      </section>

      <section>
        <div style={heading}>
          <h2 style={h2}>Inbox <span style={count}>{inbox.length}</span></h2>
          <button type="button" onClick={push} disabled={!chosen.length} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', opacity: chosen.length ? 1 : 0.4, padding: '10px 18px', fontSize: '0.9rem' }}>
            Push {chosen.length || ''}
          </button>
        </div>
        {loaded && !inbox.length && <p style={empty}>Empty</p>}
        {inbox.map((i) => (
          <div key={i.id} style={{ ...row, opacity: picked.has(i.id) ? 1 : 0.55 }}>
            <input type="checkbox" checked={picked.has(i.id)} onChange={() => toggle(i.id)} style={{ marginTop: '4px', accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Meta game={title[i.game] ?? i.game} when={ago(i.createdAt)} at={moment(i.context)} />
              {editing === i.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} autoFocus style={field} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => save(i.id)} style={{ ...btn, background: 'var(--accent)', color: '#1a1206' }}>Save</button>
                    <button type="button" onClick={() => setEditing(null)} style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text)' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p onClick={() => { setEditing(i.id); setDraft(i.text); }} style={{ ...text, cursor: 'text', color: i.text ? 'var(--text)' : 'var(--text-muted)' }}>{i.text || (i.hasAudio ? '' : 'Empty')}</p>
              )}
              <Said item={i} showText={false} />
              {i.status === 'failed' && i.note && <p style={{ ...note, color: 'var(--accent-red)' }}>{i.note}</p>}
            </div>
            <button type="button" onClick={() => setStatus(i.id, 'dismissed')} title="Set aside" style={x}>×</button>
          </div>
        ))}
      </section>

      {working.length > 0 && (
        <section>
          <div style={heading}>
            <h2 style={h2}>In progress <span style={count}>{working.length}</span></h2>
            {working.length > 1 && <button type="button" onClick={() => stop(working.map((i) => i.id))} style={{ ...btn, background: 'transparent', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>Stop all</button>}
          </div>
          {working.map((i) => (
            <div key={i.id} style={row}>
              <span className="lab-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Meta game={title[i.game] ?? i.game} when={LABEL[i.status]} />
                <Said item={i} />
              </div>
              <button type="button" onClick={() => stop([i.id])} style={{ ...btn, background: 'transparent', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>Stop</button>
            </div>
          ))}
        </section>
      )}

      {review.length > 0 && (
        <section>
          <div style={heading}><h2 style={h2}>Review <span style={count}>{review.length}</span></h2></div>
          {Object.entries(byBatch).map(([batch, list]) => (
            <div key={batch} style={{ ...card, borderColor: 'var(--accent)', padding: '4px 16px 12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '10px 0 4px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {gamesIn(list).map((g) => (
                    <a key={g} href={`/proto/preview/${batch}/${g}.html`} target="_blank" rel="noopener" style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text)', textDecoration: 'none' }}>Try {title[g] ?? g} ↗</a>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => sendBack(batch)} style={{ ...btn, background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }}>Send back</button>
                  <button type="button" onClick={() => approve(batch)} style={{ ...btn, background: 'var(--accent)', color: '#1a1206' }}>Approve</button>
                </div>
              </div>
              {list.map((i) => (
                <div key={i.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                  <Meta game={title[i.game] ?? i.game} when={ago(i.createdAt)} />
                  <Said item={i} />
                  {i.heard && <p style={{ ...note, color: 'var(--text)' }}><b>Claude heard:</b> {i.heard}</p>}
                  {i.note && <p style={note}><b>Changed:</b> {i.note}</p>}
                  <TestLink item={i} />
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {live.length > 0 && (
        <section>
          <div style={heading}><h2 style={h2}>Live <span style={count}>{live.length}</span></h2></div>
          {Object.entries(byCommit).map(([commit, group]) => (
            <div key={commit} style={{ ...card, padding: '4px 16px 12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ago(group[0].updatedAt)} · {commit.slice(0, 7)}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[...new Set(group.map((g) => g.game))].map((g) => (
                    <a key={g} href={`/play/${g}`} style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text)', textDecoration: 'none' }}>Play {title[g]?.split(' ')[0]}</a>
                  ))}
                  {commit !== '?' && <button type="button" onClick={() => undo(commit)} style={{ ...btn, background: 'transparent', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>Undo</button>}
                </div>
              </div>
              {group.map((i) => (
                <div key={i.id} style={{ padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  <Meta game={title[i.game] ?? i.game} />
                  {i.heard ? <p style={text}>{i.heard}</p> : <Said item={i} />}
                  {i.note && <p style={note}>✓ {i.note}</p>}
                  <TestLink item={i} />
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {aside.length > 0 && (
        <section>
          <div style={heading}><h2 style={h2}>Set aside <span style={count}>{aside.length}</span></h2></div>
          {aside.map((i) => (
            <div key={i.id} style={{ ...row, opacity: 0.7 }}>
              <div style={{ flex: 1 }}>
                <Meta game={title[i.game] ?? i.game} when={i.status === 'skipped' ? 'Claude skipped' : i.status === 'undone' ? 'Undone' : 'Set aside'} />
                <Said item={i} />
                {i.note && <p style={note}>{i.note}</p>}
                {i.status === 'undone' && <TestLink item={i} />}
              </div>
              <button type="button" onClick={() => setStatus(i.id, 'new')} style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text)' }}>Back to inbox</button>
              <button type="button" onClick={() => remove(i.id)} title="Delete" style={x}>×</button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/** Where to test this note's change: the preview build while in Review, the live game once approved. */
function TestLink({ item }: { item: Item }) {
  if (!item.link) return null;
  const label = item.status === 'review' ? 'Test the preview' : 'Play it live';
  return (
    <a href={item.link} target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
      {label} ↗ <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{item.link.replace(/^https:\/\//, '')}</span>
    </a>
  );
}

/** What the tester gave: their written text, the recording (playable), and Whisper's transcript once a run made one. */
function Said({ item, showText = true }: { item: Item; showText?: boolean }) {
  return (
    <>
      {showText && item.text && <p style={text}>{item.text}</p>}
      {item.hasAudio && <audio src={`/api/lab/audio?id=${item.id}`} controls preload="none" style={{ height: '32px', width: '100%', maxWidth: '420px', marginTop: '6px' }} />}
      {item.transcript && (
        <details style={{ marginTop: '4px' }}>
          <summary style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Transcript</summary>
          <p style={{ ...note, whiteSpace: 'pre-wrap' }}>{item.transcript}</p>
        </details>
      )}
    </>
  );
}

function Meta({ game, when, at }: { game: string; when?: string; at?: string }) {
  return (
    <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
      <span style={{ fontWeight: 700, color: 'var(--text-dim)' }}>{game}</span>
      {when && <span>{when}</span>}
      {at && <span>{at}</span>}
    </div>
  );
}

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' } as const;
const field = { width: '100%', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', font: 'inherit', fontSize: '0.9rem' } as const;
const heading = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } as const;
const h2 = { fontSize: '1rem', fontWeight: 700, margin: 0 } as const;
const count = { color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' } as const;
const row = { display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 0', borderTop: '1px solid var(--border)' } as const;
const text = { margin: 0, fontSize: '0.92rem', lineHeight: 1.45, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } as const;
const note = { margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-dim)' } as const;
const empty = { color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '12px', margin: 0 } as const;
const x = { background: 'none', border: 0, color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 } as const;
