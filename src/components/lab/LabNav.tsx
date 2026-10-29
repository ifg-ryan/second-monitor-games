'use client';
// Top of every lab page: the lab's sections, and Sign out. Power users see a badge.
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const LINKS = [
  { href: '/lab/games', label: 'Games' },
  { href: '/lab/kit', label: 'Kit' },
  { href: '/lab', label: 'Feedback' },
  { href: '/lab/builds', label: 'Create Game' },
  { href: '/lab/guide', label: 'Guide' },
];
const noSubscribe = () => () => {};
const isPower = () => document.cookie.split('; ').some((c) => c === 'smg_power=1');

export default function LabNav() {
  const path = usePathname();
  const power = useSyncExternalStore(noSubscribe, isPower, () => false);
  const active = (href: string) => (href === '/lab' ? path === '/lab' : path.startsWith(href));
  return (
    <nav style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '14px' }}>
        <a href="/lab/games" style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2rem', color: 'var(--text)', textDecoration: 'none' }}>Lab</a>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '14px', alignItems: 'baseline' }}>
          {power && <span title="Can publish new games to the live site" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '4px', padding: '2px 6px' }}>POWER USER</span>}
          <button type="button" onClick={() => fetch('/api/lab/login', { method: 'DELETE' }).then(() => location.assign('/lab'))} className="nav-link-muted" style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: '0.8rem' }}>Sign out</button>
        </span>
      </div>
      <div role="tablist" className="lab-tabs">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} role="tab" aria-selected={active(l.href)} className={active(l.href) ? 'lab-tab on' : 'lab-tab'}>
            {l.label}
          </a>
        ))}
      </div>
      <style>{`
        .lab-tabs{display:flex;gap:4px;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none}
        .lab-tab{flex-shrink:0;padding:10px 18px 9px;font-size:.9rem;font-weight:600;text-decoration:none;color:var(--text-muted);border:1px solid transparent;border-bottom:0;border-radius:10px 10px 0 0;margin-bottom:-1px;transition:background .15s,color .15s}
        .lab-tab:hover{color:var(--text);background:var(--surface)}
        .lab-tab.on{color:var(--text);background:var(--surface);border-color:var(--border);box-shadow:inset 0 2px 0 var(--accent);position:relative}
        .lab-tab.on::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--surface)}
      `}</style>
    </nav>
  );
}
