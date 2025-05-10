import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloudflare Pages configuration
  output: 'export', // Changed from 'standalone' to 'export' for static site generation
  images: {
    unoptimized: true, // Required for Cloudflare Pages
    domains: ['example.supabase.co'], // Add your Supabase domain
  },
  // Ensure webpack can handle Tailwind modules
  webpack: (config) => {
    return config;
  },
  // Handle external dependencies
  transpilePackages: [],
};

export default nextConfig;
