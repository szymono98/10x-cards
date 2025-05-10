import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Production configuration for Cloudflare Pages
  ...(process.env.NODE_ENV === 'production'
    ? {
        images: {
          unoptimized: true,
          domains: ['example.supabase.co'],
        },
        skipTrailingSlashRedirect: true,
      }
    : {
        // Development configuration
        images: {
          domains: ['example.supabase.co'],
        },
      }),
  // Ensure webpack can handle Tailwind modules
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
