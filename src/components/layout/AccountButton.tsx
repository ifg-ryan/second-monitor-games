// Signed-in header button: initial and username, opening a small menu (Account, Sign out).
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

const item = { display: "block", width: "100%", textAlign: "left" as const, padding: "8px 14px", fontSize: "0.85rem", color: "var(--text)", background: "none", border: "none", cursor: "pointer", textDecoration: "none" };

export default async function AccountButton() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user
    .findUnique({ where: { clerkId: userId }, select: { username: true } })
    .catch(() => null);
  const name = user?.username ?? null;

  return (
    <details style={{ position: "relative" }}>
      <summary
        title={name ? `@${name}` : "Account"}
        style={{ listStyle: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
      >
        <span
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "50%",
            background: "var(--accent)", color: "#0d0d18", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0,
          }}
        >
          {name ? name[0].toUpperCase() : "?"}
        </span>
        {name && <span className="hidden md:inline" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{name}</span>}
      </summary>
      <div
        style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: "160px", zIndex: 60, padding: "6px 0",
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,.25)",
        }}
      >
        <a href="/account" style={item}>Account</a>
        <SignOutButton redirectUrl="/">
          <button style={item}>Sign out</button>
        </SignOutButton>
      </div>
    </details>
  );
}
