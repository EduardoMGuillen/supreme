import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { readStore } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await readStore();
  const staticRoutes = [
    "",
    "/contenido",
    "/musica",
    "/eventos",
    "/blog",
    "/acerca-de",
    "/contacto",
    "/privacidad",
    "/terminos",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(store.updatedAt),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const events = store.events
    .filter((e) => e.published)
    .map((e) => ({
      url: `${SITE_URL}/eventos/${e.slug}`,
      lastModified: new Date(store.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const posts = store.posts
    .filter((p) => p.status === "published")
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  return [...staticRoutes, ...events, ...posts];
}
