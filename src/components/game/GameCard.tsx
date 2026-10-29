import Image from "next/image";

interface GameCardProps {
  title: string;
  description: string;
  tag: string;
  href: string;
  /** Category colour along the card's top edge. */
  stripe: string;
  previewImage?: string;
  /** Jersey number: the game's place in the newest-first list. */
  number: number;
  minutes?: [number, number];
  isNew?: boolean;
  featured?: boolean;
}

export default function GameCard({ title, tag, href, stripe, previewImage, number, minutes, isNew = false }: GameCardProps) {
  return (
    <a
      href={href}
      className="smg-card"
      style={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "var(--text)", background: "var(--surface)", borderTop: `4px solid ${stripe}` }}
    >
      <div style={{ position: "relative", aspectRatio: "16 / 10", background: "var(--ink-deep)", overflow: "hidden" }}>
        {previewImage && (
          <Image
            src={previewImage}
            alt={`${title} gameplay preview`}
            fill
            style={{ objectFit: "cover", objectPosition: "top center", opacity: 0.92 }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        <span
          className="font-display"
          style={{ position: "absolute", left: "12px", bottom: "8px", fontSize: "44px", lineHeight: 1, textShadow: "0 2px 0 rgba(0,0,0,0.85)" }}
        >
          {String(number).padStart(2, "0")}
        </span>
        {isNew && (
          <span
            className="font-label"
            style={{ position: "absolute", top: "10px", right: "10px", background: "var(--accent)", color: "var(--bg)", fontSize: "13px", padding: "3px 8px" }}
          >
            New
          </span>
        )}
      </div>
      <div style={{ padding: "14px 16px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <h3 className="font-display" style={{ fontSize: "26px", lineHeight: 1.05, margin: 0 }}>{title}</h3>
        <span className="font-label" style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-muted)" }}>
          {tag}{minutes ? ` · ${minutes[0]}–${minutes[1]} min` : ""}
        </span>
      </div>
    </a>
  );
}
