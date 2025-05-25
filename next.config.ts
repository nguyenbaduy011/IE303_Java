import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  sassOptions: {
    reactStrictMode: true,
    includePaths: ["./app"],
  },
};

export default nextConfig;
