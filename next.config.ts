import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  sassOptions: {
    strictmode: true,
    includePaths: ["./app"],
  },
};

export default nextConfig;
