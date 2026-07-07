import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  // Photos upload through server actions; the default 1 MB cap rejects real
  // phone photos. Client-side compression keeps them ~0.5 MB, this is headroom.
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  // pg + pglite are server-only native/wasm deps
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
};

export default nextConfig;
