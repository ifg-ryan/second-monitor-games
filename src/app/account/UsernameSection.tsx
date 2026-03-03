"use client";

import { useState } from "react";

export default function UsernameSection({ initial }: { initial: string | null }) {
  const [current, setCurrent] = useState(initial);
  const [editing, setEditing] = useState(!initial); // auto-open if no username
  const [draft, setDraft]     = useState(initial ?? "");
  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(false);

  async function save() {
    setError("");
    setSaving(true);
    try {
      const res  = await fetch("/api/user/username", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setCurrent(data.username);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setDraft(current ?? "");
    setError("");
    setEditing(false);
  }

  return (
    <div>
      {/* Label */}
      <p
        style={{
          color:         "var(--text-muted)",
          fontSize:      "0.75rem",
          fontWeight:    600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom:  "10px",
        }}
      >
        Username
      </p>

      {editing ? (
        <div>
          {/* Prompt for users with no username */}
          {!current && (
            <p style={{ color: "#c9a84c", fontSize: "0.8rem", marginBottom: "12px" }}>
              Set a username — your real name won&apos;t appear anywhere on the site.
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div
              style={{
                display:    "flex",
                alignItems: "center",
                background: "var(--bg)",
                border:     `1px solid ${error ? "#e05252" : "var(--border)"}`,
                borderRadius: "8px",
                padding:    "0 14px",
                height:     "42px",
                gap:        "6px",
                flex:       1,
                minWidth:   "160px",
              }}
            >
              <span style={{ color: "var(--text-muted)", userSelect: "none" }}>@</span>
              <input
                autoFocus
                type="text"
                value={draft}
                onChange={(e) => { setDraft(e.target.value); setError(""); }}
                maxLength={20}
                style={{
                  flex:       1,
                  background: "none",
                  border:     "none",
                  outline:    "none",
                  color:      "var(--text)",
                  fontSize:   "0.95rem",
                  fontWeight: 500,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={save}
                disabled={saving || draft.trim().length < 3}
                style={{
                  background:   "var(--accent)",
                  color:        "#0d0d18",
                  fontWeight:   700,
                  fontSize:     "0.85rem",
                  padding:      "0 18px",
                  height:       "42px",
                  borderRadius: "8px",
                  border:       "none",
                  cursor:       saving || draft.trim().length < 3 ? "not-allowed" : "pointer",
                  opacity:      saving || draft.trim().length < 3 ? 0.5 : 1,
                  whiteSpace:   "nowrap",
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>

              {current && (
                <button
                  onClick={cancel}
                  style={{
                    background:   "none",
                    border:       "1px solid var(--border)",
                    color:        "var(--text-muted)",
                    fontWeight:   500,
                    fontSize:     "0.85rem",
                    padding:      "0 16px",
                    height:       "42px",
                    borderRadius: "8px",
                    cursor:       "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {error && (
            <p style={{ color: "#e05252", fontSize: "0.8rem", marginTop: "8px" }}>{error}</p>
          )}
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "8px" }}>
            3–20 characters. Letters, numbers, underscores only.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <p style={{ color: "var(--text)", fontSize: "1rem", fontWeight: 600 }}>
            @{current}
          </p>
          <button
            onClick={() => { setDraft(current ?? ""); setEditing(true); }}
            style={{
              background:   "none",
              border:       "1px solid var(--border)",
              color:        "var(--text-muted)",
              fontSize:     "0.8rem",
              fontWeight:   500,
              padding:      "4px 14px",
              borderRadius: "6px",
              cursor:       "pointer",
            }}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
