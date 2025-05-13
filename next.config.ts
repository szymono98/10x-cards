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
        output: 'standalone', // Optimize output for Cloudflare Pages
      }
    : {
        // Development configuration
        images: {
          domains: ['example.supabase.co'],
        },
      }),
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'], // Optimize package imports
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

    // Optimize chunk size
    if (config.optimization && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 24576, // Keep chunks under Cloudflare's 25MB limit
        minChunks: 1,
      };
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
