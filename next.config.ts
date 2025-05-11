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
        poweredByHeader: false,
        compress: true,
      }
    : {
        // Development configuration
        images: {
          domains: ['example.supabase.co'],
        },
      }),
  
  experimental: {
    optimizeCss: true,
  },

  // Cloudflare Pages specific configuration
  typescript: {
    ignoreBuildErrors: true
  },

  // Configure webpack for Cloudflare Pages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "path": false,
        "os": false,
      }
    }
    return config;
  },

  // Rewrite API routes for Cloudflare Pages
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  }
};

export default nextConfig;
