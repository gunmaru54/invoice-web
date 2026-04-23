import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer가 canvas 등 브라우저 전용 모듈을 참조하므로
  // Vercel 빌드 시 webpack 서버 번들 포함 방지를 위해 외부 패키지로 지정
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.notion.so",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
