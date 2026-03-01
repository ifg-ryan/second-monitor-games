import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "Decode — Free Daily Word Puzzle on Second Monitor Games";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

// A sample solved grid to illustrate the game visually
const SAMPLE_GRID = [
  ["correct", "absent",  "present", "absent",  "absent" ],
  ["absent",  "correct", "absent",  "present", "absent" ],
  ["correct", "correct", "correct", "correct", "correct"],
];

const TILE_COLORS: Record<string, string> = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent:  "#3a3a3c",
  empty:   "#121213",
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:     "#121213",
          width:          "100%",
          height:         "100%",
          display:        "flex",
          flexDirection:  "row",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "80px",
          padding:        "60px",
        }}
      >
        {/* Left — tile grid */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "8px",
          }}
        >
          {SAMPLE_GRID.map((row, ri) => (
            <div
              key={ri}
              style={{ display: "flex", flexDirection: "row", gap: "8px" }}
            >
              {row.map((state, ci) => (
                <div
                  key={ci}
                  style={{
                    width:        "72px",
                    height:       "72px",
                    background:   TILE_COLORS[state],
                    borderRadius: "6px",
                  }}
                />
              ))}
            </div>
          ))}
          {/* Two empty rows */}
          {[0, 1].map((ri) => (
            <div
              key={`e${ri}`}
              style={{ display: "flex", flexDirection: "row", gap: "8px" }}
            >
              {[0, 1, 2, 3, 4].map((ci) => (
                <div
                  key={ci}
                  style={{
                    width:        "72px",
                    height:       "72px",
                    background:   TILE_COLORS.empty,
                    borderRadius: "6px",
                    border:       "2px solid #3a3a3c",
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Right — text */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "16px",
          }}
        >
          {/* Game type chip */}
          <div
            style={{
              background:    "rgba(83,141,78,0.2)",
              border:        "1px solid rgba(83,141,78,0.4)",
              borderRadius:  "6px",
              padding:       "5px 14px",
              fontSize:      "13px",
              fontWeight:    700,
              letterSpacing: "0.12em",
              color:         "#538d4e",
              fontFamily:    "sans-serif",
              alignSelf:     "flex-start",
            }}
          >
            FREE WORD PUZZLE
          </div>

          {/* Title */}
          <div
            style={{
              fontSize:      "72px",
              fontWeight:    700,
              color:         "#f0eee8",
              fontFamily:    "serif",
              lineHeight:    1.0,
              letterSpacing: "-0.02em",
            }}
          >
            Decode
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize:   "22px",
              color:      "#818384",
              fontFamily: "sans-serif",
              lineHeight: 1.4,
              maxWidth:   "400px",
            }}
          >
            Guess the five-letter word in six tries.
            New puzzle every day — free to play.
          </div>

          {/* Feature pills */}
          <div
            style={{
              display:       "flex",
              flexDirection: "row",
              gap:           "10px",
              marginTop:     "8px",
              flexWrap:      "wrap",
            }}
          >
            {["Daily puzzle", "6 attempts", "Track your streak", "Free forever"].map((f) => (
              <div
                key={f}
                style={{
                  background:   "#1a1a1b",
                  border:       "1px solid #3a3a3c",
                  borderRadius: "999px",
                  padding:      "6px 16px",
                  fontSize:     "14px",
                  color:        "#818384",
                  fontFamily:   "sans-serif",
                  fontWeight:   500,
                }}
              >
                {f}
              </div>
            ))}
          </div>

          {/* URL */}
          <div
            style={{
              marginTop:  "16px",
              fontSize:   "16px",
              color:      "#538d4e",
              fontFamily: "sans-serif",
              fontWeight: 600,
            }}
          >
            secondmonitorgames.com/games/decode
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
