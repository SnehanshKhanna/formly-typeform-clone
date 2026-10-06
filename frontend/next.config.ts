import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
