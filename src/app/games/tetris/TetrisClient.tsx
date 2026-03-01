'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef, useCallback } from 'react';

export default function TetrisClient() {
  const { user, isLoaded } = useUser();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Track whether the iframe has signalled it's ready
  const iframeReadyRef = useRef(false);

  const getDisplayName = useCallback(() => {
    if (!user) return 'Guest';
    return user.fullName || user.firstName || user.username || 'Player';
  }, [user]);

  const sendPlayerInfo = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'PLAYER_INFO',
        name: getDisplayName(),
        isLoggedIn: !!user,
      },
      window.location.origin
    );
  }, [user, getDisplayName]);

  // When Clerk finishes loading, push player info into the iframe
  // (handles cases where iframe was already READY before Clerk resolved)
  useEffect(() => {
    if (!isLoaded) return;
    if (iframeReadyRef.current) {
      sendPlayerInfo();
    }
  }, [isLoaded, sendPlayerInfo]);

  // Listen for messages from the Tetris iframe
  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      // Security: only accept messages from our own iframe
      if (e.source !== iframeRef.current?.contentWindow) return;

      if (e.data?.type === 'READY') {
        iframeReadyRef.current = true;
        // Respond immediately if Clerk is already loaded
        if (isLoaded) sendPlayerInfo();
      }

      if (e.data?.type === 'GAME_OVER') {
        const { score, lines, level } = e.data as {
          score: number;
          lines: number;
          level: number;
        };
        // Only submit for signed-in users
        if (!user) return;
        try {
          await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ game: 'tetris', score, lines, level }),
          });
        } catch (err) {
          console.error('Failed to submit score:', err);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, isLoaded, sendPlayerInfo]);

  return (
    <iframe
      ref={iframeRef}
      src="/games/tetris.html"
      title="Tetris"
      style={{
        width: '100%',
        flex: 1,
        border: 'none',
        display: 'block',
        background: '#1a1a2e',
      }}
      allowFullScreen
    />
  );
}
