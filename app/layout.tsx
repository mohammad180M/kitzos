import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import { getBaseMetadata, getSiteUrl } from "@/lib/seo";
import { getSiteIconsMetadata, SITE_ICON_PATHS } from "@/lib/site-icons";
import { themeInitScript } from "@/lib/theme-script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...getBaseMetadata(),
  manifest: "/site.webmanifest",
  icons: getSiteIconsMetadata(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="alternate" type="application/rss+xml" title="kitzos tools feed" href="/feed.xml" />
        <link
          rel="icon"
          type="image/png"
          href={`${getSiteUrl()}${SITE_ICON_PATHS.icon48}`}
          sizes="48x48"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2890911389961532"
          crossOrigin="anonymous"
        />
        <script
          id="kitzos-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
        <CloudflareAnalytics />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
