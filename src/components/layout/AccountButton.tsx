import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function AccountButton() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where:  { clerkId: userId },
    select: { username: true },
  });

  const initial = user?.username
    ? user.username[0].toUpperCase()
    : "?";

  return (
    <a
      href="/account"
      title={user?.username ? `@${user.username}` : "Account"}
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        width:           "34px",
        height:          "34px",
        borderRadius:    "50%",
        background:      "var(--accent)",
        color:           "#0d0d18",
        fontWeight:      700,
        fontSize:        "0.85rem",
        textDecoration:  "none",
        flexShrink:      0,
        letterSpacing:   "0",
      }}
    >
      {initial}
    </a>
  );
}
