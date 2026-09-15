import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 将 SQLite 数据库文件打包进 API 路由的 serverless bundle（Vercel 部署必需）
  outputFileTracingIncludes: {
    "/api/**": ["./db/custom.db"],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
