import type { MetadataRoute } from "next";
import { allSpecies } from "@/data/species";
import { starterBiteBoards } from "@/data/bite-boards";
import { starterTips } from "@/data/tips";

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://reelfishhelp.vercel.app").replace(/\/$/, "");

// generic entries that were split into per-species profiles (retired / hidden)
const RETIRED = new Set(["tuna", "snapper", "grouper"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ["", "/fish", "/boards", "/tips", "/terms", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const fish = allSpecies
    .filter((s) => s.active !== false && !RETIRED.has(s.slug))
    .map((s) => ({
      url: `${base}/fish/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const boards = starterBiteBoards.map((b) => ({
    url: `${base}/boards/${b.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const tipPages = starterTips.map((t) => ({
    url: `${base}/tips/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...tipPages, ...fish, ...boards];
}
