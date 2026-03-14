import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ["lastfm.freetls.fastly.net"],
  },
};

export default nextConfig;
