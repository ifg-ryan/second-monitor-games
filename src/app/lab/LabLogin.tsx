'use client';
import { useState } from 'react';
import { btn } from '@/components/lab/FeedbackComposer';

export default function LabLogin() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/lab/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode: code }) });
    if (res.ok) location.reload();
    else setError('Wrong passcode');
  }
  return (
    <form onSubmit={go} style={{ maxWidth: '320px', margin: '80px auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '2rem', margin: 0 }}>Lab</h1>
      <input
        type="password"
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Passcode"
        style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', font: 'inherit' }}
      />
      {error && <span style={{ color: 'var(--accent-red)', fontSize: '0.8rem' }}>{error}</span>}
      <button type="submit" style={{ ...btn, background: 'var(--accent)', color: '#1a1206', padding: '10px' }}>Enter</button>
    </form>
  );
}
