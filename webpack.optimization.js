/**
 * Webpack optimization utilities for 10x Cards
 * Addresses webpack cache performance issues with large strings
 */

/**
 * Configure webpack cache settings for better performance
 * @param {Object} config - Webpack configuration object
 * @param {boolean} isDev - Whether we're in development mode
 */
export function optimizeWebpackCache(config, isDev) {
  if (isDev && config.cache) {
    // Use memory cache in development to avoid serialization issues
    config.cache = {
      type: 'memory',
      maxGenerations: 1,
    };
  }
}

/**
 * Configure source maps for better development experience without performance issues
 * @param {Object} config - Webpack configuration object
 * @param {boolean} isDev - Whether we're in development mode
 */
export function optimizeSourceMaps(config, isDev) {
  if (isDev) {
    // Use faster source map generation that doesn't create huge strings
    config.devtool = 'eval-cheap-module-source-map';
  }
}

/**
 * Configure module resolution to reduce bundle size
 * @param {Object} config - Webpack configuration object
 */
export function optimizeModuleResolution(config) {
  // Optimize module resolution for faster builds
  config.resolve = {
    ...config.resolve,
    symlinks: false,
    modules: ['node_modules'],
  };
}

/**
 * Apply all webpack optimizations
 * @param {Object} config - Webpack configuration object
 * @param {boolean} isDev - Whether we're in development mode
 * @param {boolean} isServer - Whether this is server-side rendering
 */
export function applyWebpackOptimizations(config, isDev, isServer) {
  optimizeWebpackCache(config, isDev);
  optimizeSourceMaps(config, isDev);
  optimizeModuleResolution(config);

  // Additional optimizations for client bundles
  if (!isServer) {
    // Reduce chunk size to prevent large string serialization
    if (config.optimization) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        maxSize: 100000, // 100kB max chunks to avoid serialization warnings
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 100000,
          },
        },
      };
    }
  }
}
