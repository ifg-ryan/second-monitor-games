'use client';
// A feedback note: record it, write it, upload written notes (.txt / .md), or any mix, then Send to the /lab queue.
// Used by the Feedback button on game pages and the "add a note" box on /lab.
import { useEffect, useRef, useState } from 'react';
import { clock, useRecorder } from './useRecorder';

export interface ComposerProps {
  game: string;
  context?: () => Record<string, string | number>;
  autoRecord?: boolean;
  onSent?: () => void;
}

async function base64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export default function FeedbackComposer({ game, context, autoRecord, onSent }: ComposerProps) {
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const rec = useRecorder();
  const file = useRef<HTMLInputElement>(null);
  const autoStarted = useRef(false);

  useEffect(() => {
    if (autoRecord && !autoStarted.current) {
      autoStarted.current = true;
      rec.start();
    }
  }, [autoRecord, rec]);

  async function upload(files: FileList | null) {
    const parts = await Promise.all([...(files ?? [])].map((f) => f.text()));
    const added = parts.map((p) => p.trim()).filter(Boolean).join('\n\n');
    if (added) setText((t) => (t.trim() ? `${t.trim()}\n\n${added}` : added));
    if (file.current) file.current.value = '';
  }

  async function send() {
    const clip = rec.recording ? await rec.stop() : rec.clip;
    const note = text.trim();
    if (!note && !clip) return;
    setState('sending');
    const res = await fetch('/api/lab/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, text: note, context: context?.(), ...(clip ? { audio: await base64(clip.blob), audioType: clip.type } : {}) }),
    }).catch(() => null);
    if (res?.ok) {
      setText('');
      rec.clear();
      setState('sent');
      setMessage('Sent to the lab');
      onSent?.();
      setTimeout(() => setState('idle'), 1800);
    } else {
      setState('error');
      setMessage((await res?.json().catch(() => null))?.error ?? 'Could not send. Try again.');
    }
  }

  const ready = !!text.trim() || !!rec.clip || rec.recording;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
        {rec.recording ? (
          <button type="button" onClick={() => void rec.stop()} style={{ ...btn, background: 'var(--accent-red)', color: '#fff' }}>
            <span className="lab-pulse">●</span> Stop {clock(rec.seconds)}
          </button>
        ) : rec.clip ? (
          <>
            <audio src={rec.clip.url} controls style={{ height: '36px', flex: 1, minWidth: 0 }} />
            <button type="button" onClick={rec.clear} title="Delete recording" style={iconBtn}>×</button>
          </>
        ) : (
          <button type="button" onClick={rec.start} style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text)' }}>● Record</button>
        )}
        {!rec.clip && !rec.recording && <span style={{ flex: 1 }} />}
        <button type="button" onClick={() => file.current?.click()} title="Upload written notes (.txt, .md)" style={{ ...btn, background: 'var(--surface-2)', color: 'var(--text)' }}>Upload</button>
        <input ref={file} type="file" accept=".txt,.md,.markdown,text/plain,text/markdown" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
        }}
        placeholder="Notes"
        rows={4}
        style={{ width: '100%', resize: 'vertical', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', font: 'inherit', fontSize: '0.9rem' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ flex: 1, fontSize: '0.75rem', color: state === 'error' || rec.error ? 'var(--accent-red)' : 'var(--text-muted)' }}>
          {rec.error ?? (state === 'sent' || state === 'error' ? message : '')}
        </span>
        <button type="button" onClick={send} disabled={!ready || state === 'sending'} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', opacity: ready ? 1 : 0.5 }}>
          {state === 'sending' ? 'Sending…' : 'Send'}
        </button>
      </div>
      <style>{`@keyframes labPulse{0%,100%{opacity:1}50%{opacity:.25}}.lab-pulse{animation:labPulse 1.2s ease-in-out infinite}`}</style>
    </div>
  );
}

export const btn = { border: 0, borderRadius: '8px', padding: '8px 14px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' } as const;
const iconBtn = { background: 'none', border: 0, color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 } as const;
