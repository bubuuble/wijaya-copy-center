import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'enxvjrntzcqmgthgyzgh.supabase.co', // Hostname dari error kamu
        port: '',
        pathname: '/storage/v1/object/public/**', // Jalur akses file storage
      },
    ],
  },
};

export default nextConfig;