import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.bicakmarket.com",
      },
    ],
    // Disable image optimization completely to preserve PNG transparency
    unoptimized: true,
  },
};

export default nextConfig;

