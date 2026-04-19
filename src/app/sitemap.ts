import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

const PUBLIC_PATHS = [
  "/",
  "/event-list",
  "/help",
  "/help/admin",
  "/help/ticket",
  "/help/inventory",
  "/help/register",
  "/help/management",
  "/terms",
  "/policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
