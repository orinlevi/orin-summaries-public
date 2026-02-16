import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@orin/remark-mkdocs"],
  serverExternalPackages: ["katex"],
};

export default nextConfig;
