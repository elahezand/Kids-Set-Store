const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: siteUrl.protocol.replace(":", ""),
        hostname: siteUrl.hostname,
        ...(siteUrl.port ? { port: siteUrl.port } : {}),
        pathname: "/uploads/**",
      },
    ],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
