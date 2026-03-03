"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function OnboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [username, setUsername] = useState("");
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);

  // Redirect signed-out users
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/sign-in?redirect_url=/onboard");
  }, [isLoaded, isSignedIn, router]);

  // Check if user already has a username — skip onboarding
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => { if (d.username) router.replace("/"); })
      .catch(() => {});
  }, [isLoaded, isSignedIn, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res  = await fetch("/api/user/username", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      router.replace("/");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) return null;

  return (
    <div
      style={{
        background:     "var(--bg)",
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display:       "inline-block",
              background:    "var(--accent-dim)",
              color:         "var(--accent)",
              fontSize:      "11px",
              fontWeight:    700,
              letterSpacing: "0.12em",
              padding:       "4px 12px",
              borderRadius:  "4px",
              textTransform: "uppercase",
              marginBottom:  "16px",
            }}
          >
            One last step
          </div>
          <h1
            style={{
              fontFamily: "var(--font-dm-serif)",
              color:      "var(--text)",
              fontSize:   "1.75rem",
              lineHeight: 1.2,
              marginBottom: "10px",
            }}
          >
            Choose a username
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            This is what others will see on leaderboards — not your real name.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "8px" }}>
            <div
              style={{
                display:       "flex",
                alignItems:    "center",
                background:    "var(--surface)",
                border:        `1px solid ${error ? "#e05252" : "var(--border)"}`,
                borderRadius:  "10px",
                padding:       "0 16px",
                height:        "52px",
                gap:           "8px",
              }}
            >
              <span style={{ color: "var(--text-muted)", fontSize: "1rem", userSelect: "none" }}>@</span>
              <input
                autoFocus
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="yourname"
                maxLength={20}
                style={{
                  flex:       1,
                  background: "none",
                  border:     "none",
                  outline:    "none",
                  color:      "var(--text)",
                  fontSize:   "1rem",
                  fontWeight: 500,
                }}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: "#e05252", fontSize: "0.8rem", marginBottom: "12px" }}>{error}</p>
          )}

          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "24px" }}>
            3–20 characters. Letters, numbers, and underscores only.
          </p>

          <button
            type="submit"
            disabled={saving || username.length < 3}
            style={{
              width:          "100%",
              background:     "var(--accent)",
              color:          "#0d0d18",
              fontWeight:     700,
              fontSize:       "0.95rem",
              padding:        "14px",
              borderRadius:   "10px",
              border:         "none",
              cursor:         saving || username.length < 3 ? "not-allowed" : "pointer",
              opacity:        saving || username.length < 3 ? 0.6 : 1,
              transition:     "opacity 0.15s",
            }}
          >
            {saving ? "Saving…" : "Save & continue →"}
          </button>
        </form>

      </div>
    </div>
  );
}
