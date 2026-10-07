import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/forms/:id',
        destination: '/forms/:id/create',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
