'use client';
// Top of every lab page: the lab's sections, and Sign out. Power users see a badge.
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const LINKS = [
  { href: '/lab', label: 'Feedback' },
  { href: '/lab/games', label: 'Games' },
  { href: '/lab/builds', label: 'Create Game' },
  { href: '/lab/kit', label: 'Kit' },
  { href: '/lab/guide', label: 'Guide' },
];
const noSubscribe = () => () => {};
const isPower = () => document.cookie.split('; ').some((c) => c === 'smg_power=1');

export default function LabNav() {
  const path = usePathname();
  const power = useSyncExternalStore(noSubscribe, isPower, () => false);
  const active = (href: string) => (href === '/lab' ? path === '/lab' : path.startsWith(href));
  return (
    <nav style={{ display: 'flex', alignItems: 'baseline', gap: '20px', flexWrap: 'wrap', marginBottom: '28px' }}>
      <a href="/lab" style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2rem', color: 'var(--text)', textDecoration: 'none', marginRight: '8px' }}>Lab</a>
      {LINKS.map((l) => (
        <a key={l.href} href={l.href} className={active(l.href) ? undefined : 'nav-link-muted'} style={{ fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', color: active(l.href) ? 'var(--accent)' : undefined }}>
          {l.label}
        </a>
      ))}
      <span style={{ marginLeft: 'auto', display: 'flex', gap: '14px', alignItems: 'baseline' }}>
        {power && <span title="Can publish new games to the live site" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '4px', padding: '2px 6px' }}>POWER USER</span>}
        <button type="button" onClick={() => fetch('/api/lab/login', { method: 'DELETE' }).then(() => location.assign('/lab'))} className="nav-link-muted" style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: '0.8rem' }}>Sign out</button>
      </span>
    </nav>
  );
}
