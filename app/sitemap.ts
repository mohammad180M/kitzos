import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { tools } from "@/lib/registry";
import { INFO_PAGES } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/${category.id}/`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const infoPages: MetadataRoute.Sitemap = INFO_PAGES.map((page) => ({
    url: `${siteUrl}${page.path}/`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...infoPages];
}
