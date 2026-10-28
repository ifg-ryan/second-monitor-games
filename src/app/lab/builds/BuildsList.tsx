'use client';
// Upload a GDD (PDF, Word, Markdown or text) and see every build with where it stands.
import { useCallback, useEffect, useRef, useState } from 'react';
import LabNav from '@/components/lab/LabNav';
import { btn } from '@/components/lab/FeedbackComposer';
import { StatusBadge, type Build } from './status';

async function base64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export default function BuildsList() {
  const [builds, setBuilds] = useState<Build[] | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/lab/builds', { cache: 'no-store' }).catch(() => null);
    if (res?.ok) setBuilds((await res.json()).builds);
  }, []);
  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(load, 15000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [load]);

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\b(gdd|v\d+(\.\d+)*)\b/gi, '').trim());
  }

  async function upload() {
    if (!file || !title.trim()) return;
    setBusy(true);
    setError('');
    const res = await fetch('/api/lab/builds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, notes, fileName: file.name, data: await base64(file) }) }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError((await res?.json().catch(() => null))?.error ?? 'Upload failed');
    const { build } = await res.json();
    location.assign(`/lab/builds/${build.id}`);
  }

  return (
    <div>
      <LabNav />
      <section
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Build a new game from a GDD</h2>
        <button type="button" onClick={() => input.current?.click()} style={{ border: '1px dashed var(--border)', background: 'var(--bg)', color: file ? 'var(--text)' : 'var(--text-muted)', borderRadius: '10px', padding: '22px', cursor: 'pointer', font: 'inherit', fontSize: '0.9rem' }}>
          {file ? `📄 ${file.name} (${Math.round(file.size / 1024)} KB)` : 'Drop the GDD here, or click to choose (PDF, Word, Markdown, text · up to 3 MB)'}
        </button>
        <input ref={input} type="file" accept=".pdf,.docx,.md,.markdown,.txt" hidden onChange={(e) => pick(e.target.files?.[0])} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Game title" style={field} />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything to add for Claude (a look to use, what to build first, what to leave out)" style={{ ...field, resize: 'vertical' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--accent-red)' }}>{error}</span>
          <button type="button" onClick={upload} disabled={!file || !title.trim() || busy} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', padding: '10px 18px', opacity: file && title.trim() ? 1 : 0.4 }}>
            {busy ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </section>

      <h2 style={{ fontSize: '1rem', margin: '32px 0 8px' }}>Games</h2>
      {builds && !builds.length && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No games yet. Upload a GDD to start.</p>}
      {builds?.map((b) => (
        <a key={b.id} href={`/lab/builds/${b.id}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 4px', borderTop: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700 }}>{b.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {b.fileName} · {b.versions ? `version ${b.versions}` : 'no versions yet'}
            </div>
          </div>
          <StatusBadge status={b.status} />
        </a>
      ))}
      <style>{`@keyframes labPulse{0%,100%{opacity:1}50%{opacity:.25}}.lab-pulse{animation:labPulse 1.2s ease-in-out infinite}`}</style>
    </div>
  );
}

const field = { width: '100%', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', font: 'inherit', fontSize: '0.9rem' } as const;
