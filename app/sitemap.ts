import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { tools } from "@/lib/registry";
import { INFO_PAGES } from "@/lib/site-config";
import {
  buildSitemapLanguageAlternates,
  getSiteUrl,
} from "@/lib/seo";
import { localizedPath } from "@/lib/i18n/routing";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n/types";

export const dynamic = "force-static";

function localizedSitemapEntry(
  locale: Locale,
  path: string,
  options: {
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority: number;
  }
): MetadataRoute.Sitemap[0] {
  const siteUrl = getSiteUrl();
  return {
    url: `${siteUrl}${localizedPath(locale, path)}`,
    lastModified: new Date(),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: {
      languages: buildSitemapLanguageAlternates(path),
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const rootPage: MetadataRoute.Sitemap[0] = {
    url: `${getSiteUrl()}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: buildSitemapLanguageAlternates("/"),
    },
  };

  const homePages: MetadataRoute.Sitemap = LOCALES.map((locale) =>
    localizedSitemapEntry(locale, "/", {
      changeFrequency: "weekly",
      priority: 1,
    })
  );

  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    LOCALES.map((locale) =>
      localizedSitemapEntry(locale, `/${category.id}`, {
        changeFrequency: "weekly",
        priority: 0.8,
      })
    )
  );

  const toolPages: MetadataRoute.Sitemap = tools.flatMap((tool) =>
    LOCALES.map((locale) =>
      localizedSitemapEntry(locale, `/tools/${tool.slug}`, {
        changeFrequency: "monthly",
        priority: 0.9,
      })
    )
  );

  const infoPages: MetadataRoute.Sitemap = INFO_PAGES.flatMap((page) =>
    LOCALES.map((locale) =>
      localizedSitemapEntry(locale, page.path, {
        changeFrequency: "yearly",
        priority: 0.5,
      })
    )
  );

  return [rootPage, ...homePages, ...categoryPages, ...toolPages, ...infoPages];
}
