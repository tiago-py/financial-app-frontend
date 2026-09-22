import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  async rewrites() {
    const backendURL = process.env.BACKEND_URL ?? "http://localhost:8080";
    return [
      {
        source: "/api/backend/:path*",
        destination: backendURL + "/api/v1/:path*"
      }
    ];
  }
};

export default nextConfig;
