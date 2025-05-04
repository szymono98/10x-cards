import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Upewniamy się, że webpack może prawidłowo obsłużyć moduły Tailwind
  webpack: (config) => {
    return config;
  },
  // Upewniamy się, że Next.js jest świadomy zewnętrznych zależności
  transpilePackages: [],
  // Optymalizacja CSS
  optimizeCss: true,
  // Konfiguracja modułów CSS dla lepszej integracji z Tailwind
  cssModules: true,
};

export default nextConfig;
