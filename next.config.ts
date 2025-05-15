import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    domains: ['zoycpgodfkxzqjcuzlwf.supabase.co'],
  },
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  compress: true,
  
  typescript: {
    ignoreBuildErrors: true
  },
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  
  webpack: (config: WebpackConfig, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          path: false,
          os: false,
        }
      };
    }
    return config;
  },
}

export default nextConfig;
