import type { NextConfig } from 'next';
import path from 'path';
import type { Module } from 'webpack';

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

  // Configure webpack
  webpack: (config, { dev }) => {
    if (!dev) {
      // Optimize caching behavior
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(process.cwd(), '.next/cache/webpack'),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        version: '1.0',
        // Limit cache file size
        compression: 'gzip',
        allowCollectingMemory: false,
        memoryCacheUnaffected: false,
      };

      // Configure chunk size limits
      config.performance = {
        ...config.performance,
        maxEntrypointSize: 20000000, // 20MB
        maxAssetSize: 20000000, // 20MB
        hints: 'error',
      };

      // Add chunk splitting configuration
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: config.optimization?.minimizer ?? [],
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 20000000,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              reuseExistingChunk: true,
            },
            lib: {
              name: (module: Module) => {
                const moduleFileName = module
                  .identifier()
                  .split('/')
                  .reduceRight((item: string) => item);
                return `lib.${moduleFileName.replace(/[^a-zA-Z0-9]/g, '')}`;
              },
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
              minChunks: 2,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
