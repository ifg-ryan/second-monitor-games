'use client';
// Delete account: a checkbox to confirm, then the button. Removes scores, achievements and the login.
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';

export default function DeleteAccount() {
  const { signOut } = useClerk();
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function remove() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/user', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: true }) });
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error ?? "Couldn't delete the account. Try again.");
        return;
      }
      await signOut({ redirectUrl: '/' }).catch(() => window.location.assign('/'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <label style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} />
        Delete my scores, achievements and account
      </label>
      <button
        onClick={remove}
        disabled={!sure || busy}
        style={{ justifySelf: 'start', background: sure ? '#e05252' : 'none', color: sure ? '#fff' : 'var(--text-muted)', border: '1px solid #e05252', fontWeight: 600, fontSize: '0.85rem', padding: '8px 16px', borderRadius: '8px', cursor: sure && !busy ? 'pointer' : 'not-allowed', opacity: busy ? 0.6 : 1 }}
      >
        {busy ? 'Deleting…' : 'Delete account'}
      </button>
      {error && <p style={{ color: '#e05252', fontSize: '0.8rem' }}>{error}</p>}
    </div>
  );
}
