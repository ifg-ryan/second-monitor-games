'use client';
// The bar over a tester preview: what this batch changed, and "Push to live site" behind an
// "Are you sure?" checkbox. Pushing approves the whole batch (every game in it), then waits
// here until it is live and shows the link.
import { useEffect, useState } from 'react';
import { btn } from '@/components/lab/FeedbackComposer';

interface Note {
  id: string;
  game: string;
  gameTitle: string;
  heard: string | null;
  note: string | null;
  text: string;
  status: string;
}

export default function TryBar({ batch, game, title, notes: initial }: { batch: string; game: string; title: string; notes: Note[] }) {
  const [notes, setNotes] = useState(initial);
  const [sure, setSure] = useState(false);
  const [open, setOpen] = useState(true);
  const [error, setError] = useState('');
  const state = notes.some((n) => n.status === 'review') ? 'review' : notes.some((n) => n.status === 'approving') ? 'approving' : notes.some((n) => n.status === 'live') ? 'live' : 'other';
  const otherGames = [...new Set(notes.filter((n) => n.game !== game).map((n) => n.gameTitle))];

  // While going live, check every 10 seconds until the run reports back.
  useEffect(() => {
    if (state !== 'approving') return;
    const t = setInterval(async () => {
      const res = await fetch('/api/lab/feedback', { cache: 'no-store' }).catch(() => null);
      if (!res?.ok) return;
      const all: { id: string; status: string; note: string | null }[] = (await res.json()).items;
      setNotes((ns) => ns.map((n) => ({ ...n, ...(all.find((a) => a.id === n.id) ?? {}) })));
    }, 10000);
    return () => clearInterval(t);
  }, [state]);

  async function goLive() {
    setError('');
    const res = await fetch('/api/lab/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ batch, action: 'approve' }) }).catch(() => null);
    if (!res?.ok) return setError((await res?.json().catch(() => null))?.error ?? 'Could not push. Try again from the lab.');
    setNotes((ns) => ns.map((n) => (n.status === 'review' ? { ...n, status: 'approving' } : n)));
  }

  return (
    <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '10px 24px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <a href="/lab" className="nav-link-muted" style={{ fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>← Lab</a>
        <span style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.05rem', color: 'var(--text)' }}>{title}</span>
        <span style={{ border: '1px solid var(--accent)', color: 'var(--accent)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase' }}>Test build</span>
        <button type="button" onClick={() => setOpen((o) => !o)} className="nav-link-muted" style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: '0.8rem', marginLeft: 'auto' }}>
          {open ? 'Hide changes ▴' : `Changes (${notes.length}) ▾`}
        </button>
      </div>
      {open && (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: '10px' }}>
          <ul style={{ flex: '1 1 420px', margin: 0, paddingLeft: '18px', listStyle: 'disc', fontSize: '0.85rem', lineHeight: 1.45, color: 'var(--text)' }}>
            {notes.map((n) => (
              <li key={n.id} style={{ marginBottom: '4px' }}>
                {n.game !== game && <b>{n.gameTitle}: </b>}
                {n.note ?? n.heard ?? n.text}
              </li>
            ))}
            {!notes.length && <li style={{ color: 'var(--text-muted)' }}>No notes found for this test build.</li>}
          </ul>
          <div style={{ flex: '0 1 320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {state === 'review' && (
              <>
                <button type="button" onClick={goLive} disabled={!sure} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', padding: '10px 16px', fontSize: '0.9rem', opacity: sure ? 1 : 0.4, cursor: sure ? 'pointer' : 'not-allowed' }}>
                  Push to live site
                </button>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.8rem', color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} style={{ marginTop: '2px', accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                  <span>Are you sure? This replaces the live {otherGames.length ? `${title} and ${otherGames.join(', ')}` : title} for everyone.</span>
                </label>
              </>
            )}
            {state === 'approving' && <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>Going live… this takes a few minutes.</span>}
            {state === 'live' && (
              <a href={`/play/${game}`} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', textDecoration: 'none', textAlign: 'center', padding: '10px 16px' }}>Live now: play it ↗</a>
            )}
            {state === 'other' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This test build is no longer waiting for review.</span>}
            {error && <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)' }}>{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
