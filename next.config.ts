import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],

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
          // Restrict browser feature APIs not needed by this site
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Legacy XSS auditor (belt-and-suspenders for older browsers)
          { key: "X-XSS-Protection",           value: "1; mode=block" },
          // Enforce HTTPS for 1 year (prod only; harmless on localhost)
          { key: "Strict-Transport-Security",  value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
