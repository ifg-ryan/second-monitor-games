'use client';
// Feedback button in a game's info bar. Only testers see it (browsers that entered the /lab passcode).
// Opening it starts the mic, so a tester can just talk, hit Send, and keep playing.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import FeedbackComposer from './FeedbackComposer';

export default function FeedbackButton({ game, build }: { game: string; build?: string }) {
  const tester = useSyncExternalStore(noSubscribe, isTesterBrowser, () => false);
  const [open, setOpen] = useState(false);
  const loaded = useRef(0);

  useEffect(() => {
    loaded.current = performance.now();
  }, []);
  if (!tester) return null;

  const context = () => ({
    build: build ?? 'unknown',
    seconds: (performance.now() - loaded.current) / 1000,
    screen: `${window.innerWidth}x${window.innerHeight}`,
    browser: navigator.userAgent.replace(/^Mozilla\/5\.0 /, '').slice(0, 120),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ background: open ? 'var(--accent)' : 'transparent', color: open ? '#1a1206' : 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '6px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
      >
        🎙 Feedback
      </button>
      {open && (
        <div
          style={{ position: 'fixed', right: '20px', bottom: '20px', width: 'min(380px, calc(100vw - 40px))', zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', whiteSpace: 'normal' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <a href="/lab" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', textDecoration: 'none' }}>Lab ↗</a>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 0, color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer' }}>×</button>
          </div>
          <FeedbackComposer game={game} context={context} autoListen />
        </div>
      )}
    </>
  );
}

const noSubscribe = () => () => {};
const isTesterBrowser = () => document.cookie.split('; ').some((c) => c === 'smg_tester=1');
