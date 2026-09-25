import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom', 'html-encoding-sniffer'],
};

export default nextConfig;
