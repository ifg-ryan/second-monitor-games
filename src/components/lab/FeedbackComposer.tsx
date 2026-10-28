'use client';
// Talk or type a note about a game, then send it to the /lab queue.
// Used by the Feedback button on game pages and the "add a note" box on /lab.
import { useEffect, useRef, useState } from 'react';
import { useDictation } from './useDictation';

export interface ComposerProps {
  game: string;
  context?: () => Record<string, string | number>;
  autoListen?: boolean;
  onSent?: () => void;
}

export default function FeedbackComposer({ game, context, autoListen, onSent }: ComposerProps) {
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const mic = useDictation((words) => setText((t) => (t ? t.replace(/\s+$/, '') + ' ' : '') + words));
  const area = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (autoListen && mic.supported && !started.current) {
      started.current = true;
      mic.start();
    }
  }, [autoListen, mic]);

  async function send() {
    const note = (text + (mic.interim ? ' ' + mic.interim : '')).trim();
    if (!note) return;
    mic.stop();
    setState('sending');
    const res = await fetch('/api/lab/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, text: note, context: context?.() }),
    }).catch(() => null);
    if (res?.ok) {
      setText('');
      setState('sent');
      setMessage('Sent to the lab');
      onSent?.();
      setTimeout(() => setState('idle'), 1800);
    } else {
      setState('error');
      setMessage((await res?.json().catch(() => null))?.error ?? 'Could not send. Try again.');
    }
  }

  const shown = text + (mic.interim ? (text ? ' ' : '') + mic.interim : '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <textarea
        ref={area}
        value={shown}
        onChange={(e) => {
          mic.stop();
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
        }}
        placeholder={mic.listening ? 'Listening…' : 'What did you notice?'}
        rows={4}
        style={{ width: '100%', resize: 'vertical', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', font: 'inherit', fontSize: '0.9rem' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {mic.supported && (
          <button
            type="button"
            onClick={mic.listening ? mic.stop : mic.start}
            aria-pressed={mic.listening}
            style={{ ...btn, background: mic.listening ? 'var(--accent-red)' : 'var(--surface-2)', color: mic.listening ? '#fff' : 'var(--text)' }}
          >
            {mic.listening ? '● Stop' : '🎙 Talk'}
          </button>
        )}
        <span style={{ flex: 1, fontSize: '0.75rem', color: state === 'error' || mic.error ? 'var(--accent-red)' : 'var(--text-muted)' }}>
          {mic.error ?? (state === 'sent' || state === 'error' ? message : '')}
        </span>
        <button type="button" onClick={send} disabled={!shown.trim() || state === 'sending'} style={{ ...btn, background: 'var(--accent)', color: '#1a1206', opacity: shown.trim() ? 1 : 0.5 }}>
          {state === 'sending' ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export const btn = { border: 0, borderRadius: '8px', padding: '8px 14px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' } as const;
