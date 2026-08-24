import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("http://localhost:9090/upload/**"),
      new URL("http://146.56.116.158:9090/upload/**"),
    ],
    dangerouslyAllowLocalIP: true, // localhost(127.0.0.1/::1) 개발 서버 허용
  },
};

export default nextConfig;
