import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
  // pg + pglite are server-only native/wasm deps
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
};

export default nextConfig;
