import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import CloudflareAnalytics from "@/components/CloudflareAnalytics";
import { getBaseMetadata } from "@/lib/seo";
import { getSiteIconsMetadata } from "@/lib/site-icons";
import { themeInitScript } from "@/lib/theme-script";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  ...getBaseMetadata(),
  icons: getSiteIconsMetadata(),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0E14" },
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
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="alternate" type="application/rss+xml" title="kitzos tools feed" href="/feed.xml" />
        <script
          id="kitzos-theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
        <CloudflareAnalytics />
      </head>
      <body className={`${fontVariables} min-h-screen flex flex-col`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
