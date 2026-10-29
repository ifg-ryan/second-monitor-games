'use client';
// The username picker. Prefills this browser's guest nickname (or the Google first name),
// checks the name as you type, then moves this browser's guest progress to the account.
import { useEffect, useRef, useState } from 'react';
import { guestProgress } from './guestProgress';

const RULE = /^[A-Za-z0-9_]{3,20}$/;
type Status = { state: 'idle' | 'checking' | 'ok' | 'bad'; error?: string };

export default function WelcomeForm({ next, suggestion }: { next: string; suggestion: string }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const [saving, setSaving] = useState(false);
  const seq = useRef(0);

  // Prefill: the nickname this browser used as a guest, else the first name from Google.
  useEffect(() => {
    const nick = guestProgress().nickname?.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').slice(0, 20);
    setName(nick && nick.length >= 3 ? nick : suggestion);
  }, [suggestion]);

  useEffect(() => {
    const n = name.trim();
    if (!n) return setStatus({ state: 'idle' });
    if (!RULE.test(n)) return setStatus({ state: 'bad', error: '3 to 20 letters, numbers or underscores.' });
    const id = ++seq.current;
    setStatus({ state: 'checking' });
    const t = setTimeout(async () => {
      try {
        const r = await (await fetch(`/api/user/username?check=${encodeURIComponent(n)}`)).json();
        if (id === seq.current) setStatus(r.ok ? { state: 'ok' } : { state: 'bad', error: r.error });
      } catch {
        if (id === seq.current) setStatus({ state: 'idle' });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [name]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || status.state === 'bad') return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/username', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: name.trim() }) });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ state: 'bad', error: data.error ?? 'Something went wrong. Try again.' });
        return;
      }
      const g = guestProgress();
      if (g.guestId || Object.keys(g.unlocks).length) {
        await fetch('/api/user/claim-guest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestId: g.guestId, unlocks: g.unlocks }) }).catch(() => null);
      }
      window.location.assign(next);
    } finally {
      setSaving(false);
    }
  }

  const border = status.state === 'bad' ? '#e05252' : status.state === 'ok' ? 'var(--accent)' : 'var(--border)';
  const ready = status.state === 'ok' && !saving;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: 'var(--font-dm-serif)', color: 'var(--text)', fontSize: '1.75rem', lineHeight: 1.2, marginBottom: '24px' }}>Pick a username</h1>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: `1px solid ${border}`, borderRadius: '10px', padding: '0 16px', height: '52px', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', userSelect: 'none' }}>@</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Username"
            style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '1rem', fontWeight: 500 }}
          />
          <span style={{ fontSize: '0.8rem', color: status.state === 'ok' ? 'var(--accent)' : 'var(--text-muted)' }}>{status.state === 'ok' ? 'Available' : status.state === 'checking' ? '…' : ''}</span>
        </div>
        <p style={{ color: '#e05252', fontSize: '0.8rem', minHeight: '1.4em', margin: '8px 0 16px' }}>{status.state === 'bad' ? status.error : ''}</p>
        <button
          type="submit"
          disabled={!ready}
          style={{ width: '100%', background: 'var(--accent)', color: '#0d0d18', fontWeight: 700, fontSize: '0.95rem', padding: '14px', borderRadius: '10px', border: 'none', cursor: ready ? 'pointer' : 'not-allowed', opacity: ready ? 1 : 0.6 }}
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
