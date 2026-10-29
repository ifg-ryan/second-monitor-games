'use client';
// Holds a kit game (a self-contained page in /proto/) inside the site.
// Keyboard input goes to the game: the frame takes focus on load and whenever it is clicked.
import { useEffect, useRef } from 'react';

export default function KitGameFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    // Pass the page's query on to the game (e.g. ?board=pirate opens that Putt Party course).
    const q = window.location.search;
    if (q && !frame.src.includes('?')) frame.src = src + q;
    const focus = () => frame.contentWindow?.focus();
    frame.addEventListener('load', focus);
    focus();
    return () => frame.removeEventListener('load', focus);
  }, [src]);
  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      allow="autoplay; fullscreen"
      style={{ flex: 1, width: '100%', border: 0, display: 'block', background: '#000' }}
    />
  );
}
