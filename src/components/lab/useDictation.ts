'use client';
// Live speech-to-text using the browser's built-in recognizer (Chrome, Edge, Safari; not Firefox).
// Free and on-device or browser-hosted; nothing is recorded or stored except the text.
//
//   const mic = useDictation((words) => setText((t) => (t ? t + ' ' : '') + words));
//   <button onClick={mic.listening ? mic.stop : mic.start}>{mic.interim}</button>
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

type Recognizer = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

type Ctor = new () => Recognizer;
function recognizerClass(): Ctor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** A recognizer wired to the given handlers, set to keep listening with live (interim) results. */
function makeRecognizer(handlers: Pick<Recognizer, 'onresult' | 'onend' | 'onerror'>): Recognizer | null {
  const C = recognizerClass();
  if (!C) return null;
  const r = new C();
  r.continuous = true;
  r.interimResults = true;
  r.lang = navigator.language || 'en-US';
  Object.assign(r, handlers);
  return r;
}

const noSubscribe = () => () => {};

export function useDictation(onFinal: (text: string) => void) {
  const supported = useSyncExternalStore(noSubscribe, () => !!recognizerClass(), () => false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Recognizer | null>(null);
  const wanted = useRef(false);
  const final = useRef(onFinal);
  useEffect(() => {
    final.current = onFinal;
  });

  useEffect(() => {
    return () => {
      wanted.current = false;
      rec.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    if (!rec.current) {
      rec.current = makeRecognizer({
        onresult: (e) => {
          let live = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            const words = res[0].transcript.trim();
            if (res.isFinal) {
              if (words) final.current(words);
            } else live += ' ' + words;
          }
          setInterim(live.trim());
        },
        // Browsers end a session after a pause; keep going until stop() is called.
        onend: () => {
          setInterim('');
          if (wanted.current) {
            try {
              rec.current?.start();
            } catch {
              wanted.current = false;
              setListening(false);
            }
          } else setListening(false);
        },
        onerror: (e) => {
          if (e.error === 'no-speech' || e.error === 'aborted') return;
          wanted.current = false;
          setError(e.error === 'not-allowed' ? 'Microphone blocked. Allow it in the address bar.' : `Mic error: ${e.error}`);
        },
      });
    }
    if (!rec.current) return;
    setError(null);
    wanted.current = true;
    try {
      rec.current.start();
      setListening(true);
    } catch {
      // Already running.
    }
  }, []);

  const stop = useCallback(() => {
    wanted.current = false;
    rec.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, interim, error, start, stop };
}
