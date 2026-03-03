"use client";

import { useState } from "react";

export default function ManageButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleManage() {
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
      {error && (
        <p style={{ color: "#e05252", fontSize: "0.875rem", marginBottom: "12px" }}>
          {error}
        </p>
      )}
      <button
        onClick={handleManage}
        disabled={loading}
        style={{
          background:   "var(--surface)",
          color:        "var(--text)",
          border:       "1px solid var(--border)",
          borderRadius: "9px",
          padding:      "11px 24px",
          fontWeight:   600,
          fontSize:     "0.9rem",
          cursor:       loading ? "not-allowed" : "pointer",
          opacity:      loading ? 0.7 : 1,
          transition:   "opacity 0.15s",
        }}
      >
        {loading ? "Redirecting…" : "Manage subscription →"}
      </button>
    </div>
  );
}
