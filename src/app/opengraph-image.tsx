import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "Second Monitor Games — Free daily puzzle games";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     "#0d0d18",
          width:          "100%",
          height:         "100%",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          padding:        "60px",
          position:       "relative",
        }}
      >
        {/* Subtle grid dots pattern */}
        <div
          style={{
            position:   "absolute",
            inset:      0,
            background: "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0d0d18 70%)",
          }}
        />

        {/* Accent glow */}
        <div
          style={{
            position:     "absolute",
            top:          "50%",
            left:         "50%",
            transform:    "translate(-50%, -50%)",
            width:        "600px",
            height:       "300px",
            background:   "radial-gradient(ellipse, rgba(232,168,56,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Game icons row */}
        <div
          style={{
            display:        "flex",
            flexDirection:  "row",
            gap:            "20px",
            marginBottom:   "40px",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          {[
            { icon: "🃏", label: "CARD STRATEGY", color: "#c9a84c" },
            { icon: "🟩", label: "WORD PUZZLE",   color: "#538d4e" },
            { icon: "🟦", label: "ARCADE",        color: "#00c8ff" },
          ].map((g) => (
            <div
              key={g.label}
              style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                gap:            "8px",
                background:     "#14141f",
                border:         `1px solid ${g.color}33`,
                borderRadius:   "16px",
                padding:        "20px 28px",
              }}
            >
              <span style={{ fontSize: "48px" }}>{g.icon}</span>
              <span
                style={{
                  fontSize:      "11px",
                  fontWeight:    700,
                  letterSpacing: "0.12em",
                  color:         g.color,
                  fontFamily:    "sans-serif",
                }}
              >
                {g.label}
              </span>
            </div>
          ))}
        </div>

        {/* Brand */}
        <div
          style={{
            fontSize:      "52px",
            fontWeight:    700,
            color:         "#f0eee8",
            fontFamily:    "serif",
            letterSpacing: "-0.01em",
            textAlign:     "center",
            lineHeight:    1.1,
          }}
        >
          Second Monitor Games
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop:  "16px",
            fontSize:   "22px",
            color:      "#6b6b8a",
            fontFamily: "sans-serif",
            textAlign:  "center",
          }}
        >
          Free daily puzzle games — new challenges every day
        </div>

        {/* URL pill */}
        <div
          style={{
            marginTop:    "32px",
            background:   "rgba(232,168,56,0.12)",
            border:       "1px solid rgba(232,168,56,0.3)",
            borderRadius: "999px",
            padding:      "8px 24px",
            fontSize:     "16px",
            color:        "#e8a838",
            fontFamily:   "sans-serif",
            fontWeight:   600,
          }}
        >
          secondmonitorgames.com
        </div>
      </div>
    ),
    { ...size }
  );
}
