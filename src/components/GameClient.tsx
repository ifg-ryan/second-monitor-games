"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface GameClientProps {
  gameSrc: string;
  gameTitle: string;
  bgColor?: string;
  tier: "free" | "trial" | "subscriber";
  trialDaysLeft?: number;
  playerName?: string;
}

/**
 * Reusable iframe wrapper for SMG v1.1+ games.
 *
 * Handles all postMessage communication:
 *   GAME_READY   → sends USER_STATUS back to iframe
 *   GAME_OVER    → saves result to /api/game-result
 *   NAVIGATE_HOME / NAVIGATE_LEADERBOARD / UPGRADE_REQUESTED → Next.js routing
 */
export default function GameClient({
  gameSrc,
  gameTitle,
  bgColor = "#121213",
  tier,
  trialDaysLeft = 0,
  playerName,
}: GameClientProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  const sendUserStatus = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: "USER_STATUS",
        payload: { tier, trialDaysLeft, playerName },
      },
      window.location.origin,
    );
  }, [tier, trialDaysLeft, playerName]);

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      // Only accept messages from our own iframe
      if (e.source !== iframeRef.current?.contentWindow) return;

      const { type, payload } = e.data ?? {};

      switch (type) {
        case "GAME_READY":
          sendUserStatus();
          break;

        case "GAME_OVER":
          // Save result to Postgres (fire-and-forget for signed-in users)
          if (payload) {
            try {
              await fetch("/api/game-result", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
            } catch (err) {
              console.error("Failed to save game result:", err);
            }
          }
          break;

        case "NAVIGATE_HOME":
          router.push("/");
          break;

        case "NAVIGATE_LEADERBOARD":
          router.push("/leaderboard");
          break;

        case "UPGRADE_REQUESTED":
          router.push("/subscribe");
          break;

        case "NAVIGATE_TODAY":
          if (payload?.game) {
            router.push(`/games/${payload.game}`);
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sendUserStatus, router]);

  return (
    <iframe
      ref={iframeRef}
      src={gameSrc}
      title={gameTitle}
      style={{
        width: "100%",
        flex: 1,
        border: "none",
        display: "block",
        background: bgColor,
      }}
      allowFullScreen
    />
  );
}
