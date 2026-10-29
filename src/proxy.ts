import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { NAMED_COOKIE } from "@/lib/accounts-cookie";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/welcome(.*)",
]);

// Pages a signed-in player can open before picking a username.
const skipsNameCheck = createRouteMatcher([
  "/welcome(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/trpc(.*)",
  "/privacy",
  "/terms",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  // Signed in but this browser hasn't confirmed a username yet: check once (/api/user/named),
  // which remembers it in a cookie or sends them to /welcome to pick one.
  if (req.method !== "GET" || skipsNameCheck(req)) return;
  const { userId } = await auth();
  if (userId && req.cookies.get(NAMED_COOKIE)?.value !== userId) {
    const url = new URL("/api/user/named", req.url);
    url.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
