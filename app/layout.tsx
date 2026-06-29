import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import AdSenseLoader from "@/components/AdSenseLoader";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import { getBaseMetadata } from "@/lib/seo";
import { getSiteIconsMetadata } from "@/lib/site-icons";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
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
        <script
          id="kitzos-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
        <CloudflareAnalytics />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AdSenseLoader />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
