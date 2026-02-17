import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@orin/remark-mkdocs"],
  serverExternalPackages: ["katex"],
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://assets.lemonsqueezy.com https://va.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
            "img-src 'self' data: https: blob:",
            "font-src 'self' https://cdn.jsdelivr.net",
            "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://va.vercel-scripts.com",
            "frame-src https://accounts.google.com https://*.lemonsqueezy.com",
          ].join("; "),
        },
      ],
    },
  ],
  experimental: {
    optimizePackageImports: ["fuse.js"],
  },
};

export default nextConfig;
