import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],

  async redirects() {
    return [
      // AstroRogue moved to /proto/ with the other kit prototypes. Keep old links working.
      { source: "/games/astro-rogue.html", destination: "/proto/astro-rogue.html", permanent: true },
      // Decode was cut in favour of Fiver (the kit's daily word game). Keep old links working.
      { source: "/games/decode", destination: "/play/fiver", permanent: true },
      { source: "/games/decode.html", destination: "/play/fiver", permanent: true },
      // The original The Escape was replaced by the kit version. Keep old links working.
      { source: "/games/the-escape", destination: "/play/the-escape", permanent: true },
      { source: "/games/the-escape.html", destination: "/play/the-escape", permanent: true },
      { source: "/proto", destination: "/proto/index.html", permanent: false },
    ];
  },

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options",    value: "nosniff" },
          // Only allow iframing from the same origin (games iframe their own HTML files)
          { key: "X-Frame-Options",            value: "SAMEORIGIN" },
          // Stop leaking full URL in Referer to third parties
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          // Restrict browser feature APIs not needed by this site (the mic is for tester voice notes, see /lab)
          { key: "Permissions-Policy",         value: "camera=(), microphone=(self), geolocation=(), payment=()" },
          // Legacy XSS auditor (belt-and-suspenders for older browsers)
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          // Enforce HTTPS for 1 year (prod only; harmless on localhost)
          { key: "Strict-Transport-Security",  value: "max-age=31536000; includeSubDomains" },
          // CSP: allow scripts from self, inline (theme init), GA, Clerk; styles from self, inline, fonts
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://img.clerk.com https://*.clerk.accounts.dev",
              "media-src 'self' blob:",
              "connect-src 'self' https://www.google-analytics.com https://*.clerk.accounts.dev https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://*.clerk.accounts.dev",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // Prototypes from the Claude Games kit (published with its `npm run ship`).
        // Each is one self-contained HTML file with its art, fonts, sounds and
        // wasm embedded as data:/blob: URLs, which the site-wide policy blocks.
        // Same policy plus those, for /proto/ only.
        source: "/proto/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: data: https://www.googletagmanager.com https://www.google-analytics.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "media-src 'self' data: blob:",
              "connect-src 'self' data: blob: https://www.google-analytics.com",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
