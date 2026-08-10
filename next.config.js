/** @type {import('next').NextConfig} */
const { SECURITY_HEADERS, buildContentSecurityPolicy } = require("./lib/security/headers.js");

const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value })),
          { key: "Content-Security-Policy", value: buildContentSecurityPolicy(isDev) },
          ...(isDev
            ? []
            : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
