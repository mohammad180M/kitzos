/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export only for production builds. In dev, `output: "export"` +
  // `dynamicParams = false` makes Next.js throw a false "missing
  // generateStaticParams()" error even when the export exists.
  ...(process.env.NODE_ENV === "production" ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
