import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Keep `next build` and `next dev` on separate output dirs. Sharing `.next`
// (the Next 14 default) means a production build while the dev server is
// running corrupts vendor-chunks → site-wide 500 / layout.css 404.
// Prefer explicit NEXT_DIST_DIR from package.json scripts; fall back to
// npm_lifecycle_event / argv for safety.
const isNextDev =
  process.env.npm_lifecycle_event === "dev" || process.argv.includes("dev");
const distDir = process.env.NEXT_DIST_DIR || (isNextDev ? ".next-dev" : ".next");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export only for production builds. In dev, `output: "export"` +
  // `dynamicParams = false` makes Next.js throw a false "missing
  // `generateStaticParams()`" error even when the export exists.
  ...(process.env.NODE_ENV === "production" ? { output: "export" } : {}),
  distDir,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
