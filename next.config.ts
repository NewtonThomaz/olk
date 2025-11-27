import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "ylmpkyumfugbrguihwxi.supabase.co",
      },
    ],
  },
  
  reactCompiler: true,
};

export default nextConfig;