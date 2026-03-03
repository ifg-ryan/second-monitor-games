import Image from "next/image";

interface GameCardProps {
  title: string;
  description: string;
  tag: string;
  href: string;
  accentColor: string;
  bgGradient: string;
  icon: React.ReactNode;
  previewImage?: string;
  featured?: boolean;
  comingSoon?: boolean;
  isNew?: boolean;
}

export default function GameCard({
  title,
  description,
  tag,
  href,
  accentColor,
  bgGradient,
  icon,
  previewImage,
  featured = false,
  comingSoon = false,
  isNew = false,
}: GameCardProps) {
  const previewHeight = featured ? 200 : 165;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${featured ? accentColor + "55" : "var(--border)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        opacity: comingSoon ? 0.55 : 1,
        boxShadow: featured ? `0 0 40px ${accentColor}18` : "none",
      }}
      className="flex flex-col group transition-all duration-300 hover:scale-[1.015] hover:shadow-lg"
    >
      {/* Preview area */}
      <div
        style={{
          height: `${previewHeight}px`,
          background: bgGradient,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {previewImage ? (
          <>
            <Image
              src={previewImage}
              alt={`${title} gameplay preview`}
              fill
              style={{ objectFit: "cover", objectPosition: "top center" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Fade the bottom edge into the card body */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "48px",
                background: "linear-gradient(to bottom, transparent, var(--surface))",
                zIndex: 1,
              }}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div style={{ fontSize: featured ? "64px" : "52px" }}>{icon}</div>
          </div>
        )}

        {/* Badges */}
        {featured && (
          <div
            style={{
              position: "absolute", top: "12px", left: "12px", zIndex: 2,
              background: accentColor, color: "#0d0d18",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
              padding: "3px 8px", borderRadius: "4px", textTransform: "uppercase",
            }}
          >
            Featured
          </div>
        )}
        {comingSoon && (
          <div
            style={{
              position: "absolute", top: "12px", right: "12px", zIndex: 2,
              background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)",
              fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em",
              padding: "3px 8px", borderRadius: "4px", textTransform: "uppercase",
            }}
          >
            Coming Soon
          </div>
        )}
        {isNew && !comingSoon && (
          <div
            style={{
              position: "absolute", top: "12px", right: "12px", zIndex: 2,
              background: accentColor, color: "#0d0d18",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
              padding: "3px 8px", borderRadius: "4px", textTransform: "uppercase",
            }}
          >
            New
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <span
          style={{
            background: accentColor + "18",
            color: accentColor,
            fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
            padding: "3px 8px", borderRadius: "4px", textTransform: "uppercase",
            alignSelf: "flex-start",
          }}
        >
          {tag}
        </span>

        <div className="flex flex-col gap-1">
          <h3
            style={{
              fontFamily: "var(--font-dm-serif)",
              color: "var(--text)",
              fontSize: featured ? "1.5rem" : "1.25rem",
            }}
          >
            {title}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: "1.5" }}>
            {description}
          </p>
        </div>

        <div className="mt-auto pt-2">
          {comingSoon ? (
            <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 500 }}>
              Available soon
            </div>
          ) : (
            <a
              href={href}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: accentColor, color: "#0d0d18",
                fontWeight: 700, fontSize: "0.875rem",
                padding: "10px 20px", borderRadius: "8px",
                textDecoration: "none", transition: "opacity 0.2s",
              }}
              className="game-play-btn"
            >
              Play Today&apos;s Game
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="#0d0d18" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
