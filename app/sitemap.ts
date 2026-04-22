import type { MetadataRoute } from "next";
import { LOCALES, ROUTES, absoluteUrl, localizedPath } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const route of ROUTES) {
    for (const locale of LOCALES) {
      const languages: Record<string, string> = {};
      for (const l of LOCALES) languages[l] = absoluteUrl(localizedPath(route, l));
      entries.push({
        url: absoluteUrl(localizedPath(route, locale)),
        lastModified: now,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.7,
        alternates: { languages },
      });
    }
  }
  return entries;
}
