'use client';
// Records the mic to a compressed audio clip (webm/opus, or mp4 on Safari) for a feedback note.
// The clip is transcribed later by Whisper on the feedback run, so it does not rely on the browser's dictation.
//
//   const rec = useRecorder();
//   rec.start(); ... rec.stop();   then rec.clip -> { blob, url, type, seconds }
import { useCallback, useEffect, useRef, useState } from 'react';

export const MAX_SECONDS = 600;

export interface Clip {
  blob: Blob;
  url: string;
  type: string;
  seconds: number;
}

function pickType(): string {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return options.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ?? '';
}

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [clip, setClip] = useState<Clip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(0);
  const finished = useRef<((c: Clip | null) => void) | null>(null);

  /** Stops recording; resolves with the finished clip (or null if nothing was recording). */
  const stop = useCallback((): Promise<Clip | null> => {
    if (timer.current) clearInterval(timer.current);
    setRecording(false);
    if (rec.current?.state !== 'recording') return Promise.resolve(null);
    const done = new Promise<Clip | null>((resolve) => (finished.current = resolve));
    rec.current.stop();
    return done;
  }, []);

  const clear = useCallback(() => {
    setClip((c) => {
      if (c) URL.revokeObjectURL(c.url);
      return null;
    });
    setSeconds(0);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('This browser cannot record. Write your notes instead.');
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setError('Microphone blocked. Allow it in the address bar.');
      return;
    }
    clear();
    const type = pickType();
    const r = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), audioBitsPerSecond: 24000 });
    const chunks: Blob[] = [];
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: r.mimeType || type || 'audio/webm' });
      const secs = Math.round((performance.now() - started.current) / 1000);
      const c = blob.size ? { blob, url: URL.createObjectURL(blob), type: blob.type, seconds: secs } : null;
      setClip(c);
      finished.current?.(c);
      finished.current = null;
    };
    rec.current = r;
    started.current = performance.now();
    r.start(1000);
    setRecording(true);
    setSeconds(0);
    timer.current = setInterval(() => {
      const s = Math.floor((performance.now() - started.current) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) void stop();
    }, 250);
  }, [clear, stop]);

  useEffect(() => () => void stop(), [stop]);

  return { recording, seconds, clip, error, start, stop, clear };
}

export function clock(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
