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
        output: 'export', // Changed from 'standalone' to 'export' for Cloudflare Pages
      }
    : {
        // Development configuration
        images: {
          domains: ['example.supabase.co'],
        },
      }),
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  // Protect sensitive environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
};

export default nextConfig;
