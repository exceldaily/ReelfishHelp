import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://reelfishhelp.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // keep private/app + API routes out of the index
      disallow: [
        "/api/",
        "/home",
        "/settings",
        "/admin",
        "/messages",
        "/catches",
        "/trips",
        "/my-gear",
        "/spots",
        "/report-a-bite",
        "/onboarding",
        "/u/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
