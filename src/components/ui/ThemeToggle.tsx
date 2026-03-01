"use client";

import { useTheme } from "@/components/ui/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      style={{
        position: "relative",
        width: "26px",
        height: "44px",
        borderRadius: "6px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        cursor: "pointer",
        outline: "none",
        flexShrink: 0,
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
        boxShadow: isLight
          ? "0 0 0 1.5px var(--accent), 0 0 10px var(--accent-dim)"
          : "none",
      }}
    >
      {/* Switch paddle — UP = light (on), DOWN = dark (off) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "4px",
          right: "4px",
          height: "20px",
          borderRadius: "4px",
          background: isLight ? "var(--accent)" : "var(--text-muted)",
          transition:
            "transform 0.28s cubic-bezier(0.34, 1.3, 0.64, 1), background 0.25s ease, box-shadow 0.25s ease",
          transform: isLight ? "translateY(4px)" : "translateY(20px)",
          boxShadow: isLight
            ? "0 2px 8px rgba(232, 168, 56, 0.5)"
            : "0 1px 4px rgba(0, 0, 0, 0.45)",
        }}
      />
    </button>
  );
}
