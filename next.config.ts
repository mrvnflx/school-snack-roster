import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The SW script must be revalidated every load so cache-policy
        // fixes (e.g. no longer caching RSC payloads) reach browsers
        // promptly instead of being stuck behind HTTP cache.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
    ];
  },
};

export default nextConfig;
