'use client';
// Holds a kit game (a self-contained page in /proto/) inside the site.
// Keyboard input goes to the game: the frame takes focus on load and whenever it is clicked.
//
// Cloud save: for a signed-in player, the account's copy of this game's save is fetched first
// and put aside in this browser (key "<game>:__pending"), and only then is the game loaded, so
// the game starts with the player's progress from any device. The kit's Storage merges it in.
// Waits at most WAIT_MS, then loads the game anyway.
import { useEffect, useRef, useState } from 'react';

const WAIT_MS = 1500;

export default function KitGameFrame({ src, title, game }: { src: string; title: string; game: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stop = new AbortController();
    const timer = setTimeout(() => stop.abort(), WAIT_MS);
    fetch(`/api/kit/save?game=${encodeURIComponent(game)}`, { credentials: 'same-origin', signal: stop.signal })
      .then(async (res) => {
        if (!res.ok) return;
        const save = await res.json();
        if (save && typeof save.rev === 'number' && save.rev > 0 && typeof save.user === 'string') {
          try {
            localStorage.setItem(`${game}:__pending`, JSON.stringify(save));
          } catch {
            /* storage blocked: the game syncs on its own */
          }
        }
      })
      .catch(() => null)
      .finally(() => {
        clearTimeout(timer);
        setReady(true);
      });
    return () => {
      clearTimeout(timer);
      stop.abort();
    };
  }, [game]);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const focus = () => frame.contentWindow?.focus();
    frame.addEventListener('load', focus);
    focus();
    return () => frame.removeEventListener('load', focus);
  }, [ready]);

  const style = { flex: 1, width: '100%', border: 0, display: 'block', background: '#000' } as const;
  if (!ready) return <div style={style} aria-busy="true" />;
  return <iframe ref={ref} src={src} title={title} allow="autoplay; fullscreen" style={style} />;
}
