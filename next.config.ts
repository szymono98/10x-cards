import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Production configuration for Cloudflare Pages
  images: {
    unoptimized: true,
    domains: ['zoycpgodfkxzqjcuzlwf.supabase.co'],
  },
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  compress: true,
  
  // Optymalizacja dla Cloudflare Pages
  output: 'standalone',
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  // Cache control dla statycznych assetów
  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      source: '/static/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],

  // Add rewrites to ensure proper API routing
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: '/functions/api/:path*',
    },
    {
      source: '/functions/api/:path*',
      destination: '/api/:path*',
    }
  ],

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
        "net": false,
        "tls": false,
        "crypto": require.resolve('crypto-browserify'),
        "stream": require.resolve('stream-browserify'),
      };
    }

    // Set DNS resolution for Supabase requests
    if (config.resolve && config.resolve.alias) {
      config.resolve.alias['dns'] = false;
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
