'use client';
// The page for one GDD build. Polls while Claude is working.
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import LabNav from '@/components/lab/LabNav';
import { btn } from '@/components/lab/FeedbackComposer';
import { StatusBadge, type Build } from '../status';

interface Reuse {
  plan?: string | null;
  reused?: string[];
  added?: string[];
  candidates?: string[];
  gameLines?: number | null;
  kitLines?: number | null;
}
type LogEntry = { at: string; event: string; text?: string };
const BUSY = ['queued', 'working', 'publishing'];
const parse = <T,>(s: string | null, fallback: T): T => {
  try {
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
};
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function BuildDetail({ id, power }: { id: string; power: boolean }) {
  const [b, setB] = useState<Build | null | undefined>(undefined);
  const [ask, setAsk] = useState('');
  const [sure, setSure] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/lab/builds', { cache: 'no-store' }).catch(() => null);
    if (res?.ok) setB(((await res.json()).builds as Build[]).find((x) => x.id === id) ?? null);
  }, [id]);
  const busy = !!b && BUSY.includes(b.status);
  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, busy ? 8000 : 30000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load, busy]);

  async function act(action: string, text?: string) {
    setSending(true);
    setError('');
    const res = await fetch('/api/lab/builds/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action, text }) }).catch(() => null);
    setSending(false);
    if (!res?.ok) return setError((await res?.json().catch(() => null))?.error ?? 'Something went wrong');
    if (action === 'delete') return location.assign('/lab/builds');
    setAsk('');
    setSure(false);
    load();
  }

  if (b === undefined) return <LabNav />;
  if (b === null) return (<><LabNav /><p>That game isn&apos;t here any more. <Link href="/lab/builds" style={{ color: 'var(--accent)' }}>All new games</Link></p></>);

  const reuse = parse<Reuse>(b.reuse, {});
  const log = parse<LogEntry[]>(b.log, []).slice().reverse();
  const preview = b.preview ? `${b.preview}?v=${encodeURIComponent(b.updatedAt)}` : null;

  return (
    <div>
      <LabNav />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2rem', margin: 0, fontWeight: 400 }}>{b.title}</h1>
        <StatusBadge status={b.status} />
        {b.versions > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>version {b.versions}</span>}
      </div>
      <p style={{ margin: '6px 0 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <a href={`/api/lab/builds/file?id=${b.id}`} target="_blank" rel="noopener" style={{ color: 'var(--accent)' }}>📄 {b.fileName}</a> · game id <code>{b.slug}</code>
        {b.notes && <> · notes: {b.notes}</>}
      </p>

      {busy && (
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span className="lab-pulse" style={{ color: 'var(--accent)' }}>●</span>
          <span style={{ flex: 1, fontSize: '0.9rem' }}>
            {b.status === 'publishing' ? 'Going live: merging into the kit and shipping to the site. A few minutes.' : b.versions ? `Claude is making version ${b.versions + 1}. Usually 15 to 40 minutes.` : 'Claude is reading the GDD, matching it to the kit and building. Usually 20 to 45 minutes.'}
          </span>
          <button type="button" onClick={() => act('stop')} disabled={sending} style={{ ...btn, background: 'transparent', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}>Stop</button>
        </div>
      )}

      {b.status === 'live' && (
        <div style={{ ...card, borderColor: 'var(--accent)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ flex: 1 }}>Live on the site.</span>
          <a href={`/play/${b.slug}`} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', textDecoration: 'none' }}>Play it live ↗</a>
        </div>
      )}

      {b.note && <p style={{ ...card, margin: '0 0 16px', fontSize: '0.9rem', lineHeight: 1.5, ...(b.status === 'failed' ? { borderColor: 'var(--accent-red)' } : {}) }}><b>{b.status === 'failed' ? 'What went wrong: ' : `Version ${b.versions}: `}</b>{b.note}</p>}

      {preview && b.status !== 'live' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <b style={{ fontSize: '0.9rem' }}>Test build{b.versions ? `, version ${b.versions}` : ''}</b>
            <a href={preview} target="_blank" rel="noopener" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Open full window ↗</a>
          </div>
          <iframe src={preview} title={`${b.title} test build`} allow="autoplay; fullscreen" style={{ width: '100%', height: '68vh', minHeight: '420px', border: '1px solid var(--border)', borderRadius: '10px', background: '#000' }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(b.status === 'draft' || (b.status === 'failed' && !b.versions)) && (
            <div style={card}>
              <b>Build it</b>
              <p style={small}>Claude reads the GDD, maps it to the kit, builds the game from kit pieces and adds anything reusable back into the kit. You get a test build here.</p>
              <button type="button" onClick={() => act('push')} disabled={sending} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', padding: '10px 18px' }}>Push to Claude</button>
            </div>
          )}
          {(b.status === 'review' || b.status === 'requested' || (b.status === 'failed' && b.versions > 0)) && (
            <div style={card}>
              <b>Ask for changes</b>
              <textarea value={ask} onChange={(e) => setAsk(e.target.value)} rows={4} placeholder="What should change in the next version?" style={field} />
              <button type="button" onClick={() => act('push', ask)} disabled={sending || !ask.trim()} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', padding: '10px 18px', opacity: ask.trim() ? 1 : 0.4 }}>Push changes to Claude</button>
            </div>
          )}
          {b.status === 'review' && (
            <div style={card}>
              <b>Happy with this version?</b>
              <p style={small}>Send it to a power user, who puts it on the live site.</p>
              <button type="button" onClick={() => act('send')} disabled={sending} style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text)', padding: '10px 18px' }}>Send to power user</button>
            </div>
          )}
          {b.status === 'requested' && (
            <div style={{ ...card, borderColor: 'var(--accent)' }}>
              <b>Waiting for a power user to publish version {b.versions}</b>
              {power ? (
                <>
                  <button type="button" onClick={() => act('publish')} disabled={!sure || sending} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', padding: '10px 18px', marginTop: '10px', opacity: sure ? 1 : 0.4, cursor: sure ? 'pointer' : 'not-allowed' }}>Publish to live site</button>
                  <label style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                    Are you sure? This adds {b.title} to the live site and its code to the kit.
                  </label>
                </>
              ) : (
                <p style={small}>A power user signs in to the lab with the power-user passcode to publish it.</p>
              )}
              <button type="button" onClick={() => act('unsend')} disabled={sending} className="nav-link-muted" style={{ background: 'none', border: 0, padding: 0, marginTop: '10px', cursor: 'pointer', fontSize: '0.8rem' }}>Withdraw the request</button>
            </div>
          )}
          {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          {!busy && b.status !== 'live' && (
            <button type="button" onClick={() => confirm(`Delete ${b.title}? Its test builds stop being listed here.`) && act('delete')} className="nav-link-muted" style={{ alignSelf: 'flex-start', background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: '0.8rem' }}>Delete this game</button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(reuse.reused?.length || reuse.added?.length || reuse.plan) && (
            <div style={card}>
              <b>Kit reuse, version {b.versions}</b>
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', margin: '10px 0' }}>
                <Stat n={reuse.reused?.length ?? 0} label="kit pieces reused" />
                <Stat n={reuse.added?.length ?? 0} label="new pieces added to the kit" />
                {reuse.gameLines != null && <Stat n={reuse.gameLines} label="lines of game code" />}
              </div>
              {!!reuse.reused?.length && <p style={small}><b>Reused:</b> {reuse.reused.join(', ')}</p>}
              {!!reuse.added?.length && <p style={small}><b>Added to the kit:</b> {reuse.added.join(', ')}</p>}
              {!!reuse.candidates?.length && <p style={small}><b>Could join the kit later:</b> {reuse.candidates.join(', ')}</p>}
              {reuse.plan && (
                <details>
                  <summary style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Claude&apos;s kit plan for the GDD</summary>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.8rem', lineHeight: 1.5, margin: '8px 0 0' }}>{reuse.plan}</pre>
                </details>
              )}
            </div>
          )}
          <div style={card}>
            <b>History</b>
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', fontSize: '0.82rem' }}>
              {log.map((e, i) => (
                <li key={i} style={{ padding: '6px 0', borderTop: i ? '1px solid var(--border)' : 0 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{when(e.at)}</span> · {e.event}
                  {e.text && <div style={{ color: 'var(--text-dim)', marginTop: '2px', whiteSpace: 'pre-wrap' }}>{e.text}</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <style>{`@keyframes labPulse{0%,100%{opacity:1}50%{opacity:.25}}.lab-pulse{animation:labPulse 1.2s ease-in-out infinite}`}</style>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{n}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' } as const;
const small = { margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.5 } as const;
const field = { width: '100%', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', font: 'inherit', fontSize: '0.9rem', resize: 'vertical' } as const;
